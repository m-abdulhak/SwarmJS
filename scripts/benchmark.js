class Benchmark{
    constructor(benchSettings){              
        // Benchmarking
        this.plotColors = { 1: "midnightblue",
                            2: "green"}
        this.backgroundPlotsColors = { 1: "cornflowerblue",
                            2: "darkseagreen"}
        this.defaultSettings = [
            // Random : 
            {
                type: "Random",
                benchMaxTimesteps : 800,
                benchTimeScale : 60,
                benchRobotCount : 100,
                robotRadius : 10,
            },
            // Circle : 
            {
                type: "Circle",
                benchMaxTimesteps : 800,
                benchTimeScale : 60,
                benchRobotCount : 100,
                robotRadius : 3,
            },
            // Square 1 : 
            {
                type: "SquareHor",
                benchMaxTimesteps : 800,
                benchTimeScale : 60,
                benchRobotCount : 100,
                robotRadius : 5,
            },
            // Square 1 : 
            {
                type: "SquareHorVer",
                benchMaxTimesteps : 1600,
                benchTimeScale : 60,
                benchRobotCount : 100,
                robotRadius : 5,
            }
        ];

        this.setSettings(benchSettings);

        this.benchmarking = false;
        this.benchDeadlockAlgo = 1;

        this.simpleTotalDistancePlot = null;
        this.simpleMinDistancePlot = null;
        this.advancedTotalDistancePlot = null;
        this.advancedMinDistancePlot = null;

        this.autoSaveImageAfterEachRep = true;

        this.initGraph();
    }

    autoDownloadImage(){
        this.autoSaveImageAfterEachRep = !this.autoSaveImageAfterEachRep;
    }

    setSettings(benchSettings){
        this.settings = this.defaultSettings[benchSettings];
        
        this.benchMaxTimesteps = this.settings.benchMaxTimesteps;
        this.benchTimeScale = this.settings.benchTimeScale;
        this.benchRobotCount = this.settings.benchRobotCount;
        this.robotRadius = this.settings.robotRadius;
        
        this.benchData = {  simple : {
                sets : [],
                means : [],
                midDistanceMeans : [] 
            },
            advanced : {
                sets : [],
                means : [],
                midDistanceMeans : []
            }
        };

        this.curTotalDistanceSet = []; 
        this.curMinDistanceSet = []; 
    }
    
    updateBenchSet(time){
        if(this.benchmarking){
            this.curTotalDistanceSet[Math.floor(time/10)] = gScene.distance;

            this.curMinDistanceSet[Math.floor(time/10)] = gScene.minDistance;
            if(this.curMinDistanceSet[Math.floor((time+3)/10)] == undefined){
                gScene.minDistance = null;
            } 
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
        if(this.benchmarking && this.curTotalDistanceSet.length == 1 + Math.floor(this.benchMaxTimesteps / 10)){
            let data = this.benchDeadlockAlgo == 1 ? this.benchData.simple : this.benchData.advanced; 

            if(data.means.length == 0){
                data.means = this.curTotalDistanceSet;
                data.midDistanceMeans = this.curMinDistanceSet;
            } else{
                let setCount = data.sets.length;
                let newMeans = [];
                let newMinDistanceMeans = [];

                for (let i = 0; i < data.means.length; i++) {
                    newMeans[i] = (data.means[i] * setCount + this.curTotalDistanceSet[i] ) / (setCount + 1);
                    newMinDistanceMeans[i] = (data.midDistanceMeans[i] * setCount + this.curMinDistanceSet[i] ) / (setCount + 1);
                }

                data.means = newMeans;
                data.midDistanceMeans = newMinDistanceMeans;
            }

            this.updateGraph(this.benchDeadlockAlgo, data.means, data.midDistanceMeans, this.curTotalDistanceSet);

            data.sets.push(this.curTotalDistanceSet);
            if(this.autoSaveImageAfterEachRep){
                this.downloadImage(data.sets.length);
            }
        }
        this.curTotalDistanceSet = [];
        this.curMinDistanceSet = [];
    }

    initGraph(){
        // set the dimensions and margins of the graph
        this.margin = {top: 30, right: 30, bottom: 80, left: 60},
        this.width = 1400 - this.margin.left - this.margin.right,
        this.height = 600 - this.margin.top - this.margin.bottom;

        
        d3.select("#graph").selectAll().remove();
        this.svgGraph = d3.select("#graph")
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")");

        // X scale will fit all values from data[] within pixels 0-width
        this.x = d3.scaleLinear()
        .domain( [0, 1 + this.benchMaxTimesteps])
        .range([ 0, this.width ]);

        this.svgGraph.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x));

        // text label for the x axis
        this.svgGraph.append("text")             
        .attr("transform",
                "translate(" + (this.width/2) + " ," + 
                            (this.height + this.margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Time");

        // Y scale will fit values from 0-10 within pixels height-0 
        this.y = d3.scaleLinear()
        .domain( [0, 500])
        .range([ this.height, 0 ]);

        this.svgGraph.append("g")
        .call(d3.axisLeft(this.y));
        
        // text label for the y axis
        this.svgGraph.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - this.margin.left)
        .attr("x",0 - (this.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Distance");  

        const y1 = this.height - this.robotRadius*2;
        const y2 = this.height - this.robotRadius*2;
        const x1 = 0;
        const x2 = 999999;

        this.svgGraph.append("path")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "10,10")
            .attr("d", `M${x1},${y1}L${x2},${y2}Z`);

    }

    updateGraph(algo, totalDistanceSet, minDistance, newSet){   
        this.createPlot(bench.backgroundPlotsColors[algo], newSet, false, true);
        if(algo == 1){
            if(this.simpleTotalDistancePlot == null){
                this.simpleTotalDistancePlot = this.createPlot(bench.plotColors[algo], totalDistanceSet);
                this.simpleMinDistancePlot = this.createPlot(bench.plotColors[algo], minDistance, true);
            } else{
                this.updatePlot(this.simpleTotalDistancePlot, totalDistanceSet);
                this.updatePlot(this.simpleMinDistancePlot, minDistance);
            }
        } else{
            if(this.advancedTotalDistancePlot == null){
                this.advancedTotalDistancePlot = this.createPlot(bench.plotColors[algo], totalDistanceSet);
                this.advancedMinDistancePlot = this.createPlot(bench.plotColors[algo], minDistance, true);
            } else{
                this.updatePlot(this.advancedTotalDistancePlot, totalDistanceSet);
                this.updatePlot(this.advancedMinDistancePlot, minDistance);
            }
        }
    }

    createPlot(color, data, dashed = false, background = false){
        // Add the line
        return this.svgGraph.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", dashed? 1.5: background? 1:5)
            .attr("stroke-dasharray", dashed ? "10,10" : "10,0")
            .attr("d", d3.line()
                .x(function(d,i) { 
                    return bench.x(i)*10; 
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
                    return bench.x(i)*10; 
                })
                .y(function(d) { 
                    return bench.y(d); 
                })
            );
        let el = plot._groups[0][0];
        el.parentNode.appendChild(el);
    }  

    downloadImage(reps = null){
        let repsSec = reps == null ? "" : "__Reps-" + reps;
        let fileN = "Benchmark_" + this.settings.type +  
                        repsSec + 
                        "__Steps-" + this.settings.benchMaxTimesteps +
                        "__Robots-" + this.settings.benchRobotCount + 
                        "__Radius-" + this.settings.robotRadius +
                        "__Env-" + gScene.width + "-" + gScene.height;

            saveSvgAsPng(document.getElementById("graph").children[0], fileN + "" +".png", {scale: 5});
    }
}