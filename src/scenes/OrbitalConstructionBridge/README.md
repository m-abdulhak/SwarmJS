## Installing and preparing
- you should be installing all the dependencies for python:
```
pip install Flask Flask-SocketIO
pip install simple-websocket
```
- run flask by
```
flask --app src/scenes/OrbitalConstructionBridge/externalControllerServer.py run
```
<!-- alternatively you can create a virtual environment with name of ```.swarmjs``` and run script ```runBackend.sh``` -->

## How is it desinged


## Todo
- [x] make react to wait for response of backend before moving forward. This will make sure there is no time stamp mismatch.
- [x] reimplement orbital construction in python
- [ ] between message recievings of backend, pause simulation rather than giving zero velocity.
- [ ] clean code
- [ ] get rid of controller.js
- [ ] add RL to it according [paper](https://ieeexplore.ieee.org/document/8901087)
- [ ] how fast of simulation can backend support?

## Notes
- for making simulation wait, instead of robots asking for velocity, they should given velocity.
- speed limit is not because of python speed. if python does not do anything, still swarmjs loop speed is two time python speed.
 Between each socket data recieveing, controller does 2 loop. 
 This is because of websocket speed bottle neck.
- Robot requests should not trigger execution of pythonBridge.
 They should only access its data.
- sensors.fields.readings.heatMap.leftField has same three fields and last one is all 255
- there was a problem with command mismatch among robots. solved it by id handshaking.
- another possible improvement is creating different instance of controller for each robot and sending commands to seperate instances.
 However I feel like the bottle neck here is websocket connection traffin and not speed of instances. 
 One possible solution might be using different websocket connections per each robot. --> nope data size does not make much difference.
- increasing simulation speed doesn't actually make simulation faster here because websocket is still the bottle neck.


