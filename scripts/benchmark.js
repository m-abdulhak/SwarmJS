class Benchmark{
    constructor(benchSettings){              
        // Benchmarking
        this.plotColors = { 1: "blue",
                            2: "green"}
        this.defaultSettings = [
            // Random : 
            {
                benchMaxTimesteps : 800,
                benchTimeScale : 60,
                benchRobotCount : 100,
            },
            // Circle : 
            {
                benchMaxTimesteps : 800,
                benchTimeScale : 60,
                benchRobotCount : 100,
            }
        ];

        this.setSettings(benchSettings);

        this.benchmarking = false;
        
        this.benchDeadlockAlgo = 1;

        this.benchData = {  simple : {
                                sets : [],
                                means : []
                            },
                            advanced : {
                                sets : [],
                                means : []
                            }
                        };

        this.benchCurSet = []; 
        this.simplePlot = null;
        this.advancedPlot = null;

        this.initGraph();
    }

    setSettings(benchSettings){
        this.settings = this.defaultSettings[benchSettings];
        
        this.benchMaxTimesteps = this.settings.benchMaxTimesteps;
        this.benchTimeScale = this.settings.benchTimeScale;
        this.benchRobotCount = this.settings.benchRobotCount;
        
        this.benchData = {  simple : {
                            sets : [],
                            means : []
                            },
                            advanced : {
                                sets : [],
                                means : []
                            }
                        };

        this.benchCurSet = []; 
    }
    
    updateBenchSet(time){
        if(this.benchmarking){
            this.benchCurSet[Math.floor(time/10)] = gScene.distance;
        }
    }

    toggleBenchmarking(){
        this.benchmarking = !this.benchmarking;
        document.getElementById("benchmark-button").classList.toggle("active");

        if(this.benchmarking){
            this.startBenchmarkInstance();
        }
    }
    
    startBenchmarkInstance(){
        this.updateBenchData();

        document.getElementById("time-scale-slider").value = this.benchTimeScale;
        document.getElementById("robots-slider").value = this.benchRobotCount;
        syncSettings();

        this.benchDeadlockAlgo = this.benchDeadlockAlgo == 1 ? 2 : 1;
        selectElement('deadlock-select', this.benchDeadlockAlgo);

        resetSimulation();
    }

    updateBenchData(){
        if(this.benchmarking && this.benchCurSet.length == 1 + Math.floor(this.benchMaxTimesteps / 10)){
            let data = this.benchDeadlockAlgo == 1 ? this.benchData.simple : this.benchData.advanced; 

            if(data.means.length == 0){
                data.means = this.benchCurSet;
            } else{
                let setCount = data.sets.length;
                let newMeans = [];
                for (let i = 0; i < data.means.length; i++) {
                    newMeans[i] = (data.means[i] * setCount + this.benchCurSet[i] ) / (setCount + 1);
                }
                data.means = newMeans;
                this.updateGraph(this.benchDeadlockAlgo, data.means);
            }
            data.sets.push(this.benchCurSet);
        }
        this.benchCurSet = [];
    }

    initGraph(){
        // set the dimensions and margins of the graph
        this.margin = {top: 30, right: 30, bottom: 30, left: 50},
        this.width = 1400 - this.margin.left - this.margin.right,
        this.height = 600 - this.margin.top - this.margin.bottom;

        this.svgGraph = d3.select("#graph")
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")");

        // X scale will fit all values from data[] within pixels 0-width
        this.x = d3.scaleLinear()
        .domain( [0, 1 + this.benchMaxTimesteps/10])
        .range([ 0, this.width ]);

        this.svgGraph.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x));

        // Y scale will fit values from 0-10 within pixels height-0 
        this.y = d3.scaleLinear()
        .domain( [0, 500])
        .range([ this.height, 0 ]);

        this.svgGraph.append("g")
        .call(d3.axisLeft(this.y));
    }

    updateGraph(algo, data){   
        if(algo == 1){
            if(this.simplePlot == null){
                this.simplePlot = this.createPlot(algo, data);
            } else{
                this.updatePlot(this.simplePlot, data);
            }
        } else{
            if(this.advancedPlot == null){
                this.advancedPlot = this.createPlot(algo, data);
            } else{
                this.updatePlot(this.advancedPlot, data);
            }
        }
    }

    createPlot(algo, data){
        // Add the line
        return this.svgGraph.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", bench.plotColors[algo])
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
            .x(function(d,i) { 
                return bench.x(i); 
            })
            .y(function(d) { 
                return bench.y(d); 
            })
            );
    }

    updatePlot(plot, data){
        // update the line
        plot.datum(data)
            .attr("d", d3.line()
            .x(function(d,i) { 
                return bench.x(i); 
            })
            .y(function(d) { 
                return bench.y(d); 
            })
            );
    }  
}