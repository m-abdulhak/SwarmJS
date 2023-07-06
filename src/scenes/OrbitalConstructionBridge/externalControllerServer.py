# Example server that can used to control robots within SwarmJS.

# dependecies:
# pip install Flask Flask-SocketIO
# pip install simple-websocket

from flask import Flask
from flask_socketio import SocketIO, emit
from robot.controllers.orbital_construction import Orbital_Construction
from pdb import set_trace as debugger
from werkzeug.debug import DebuggedApplication

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'
app.wsgi_app = DebuggedApplication(app.wsgi_app, evalex=True)

# Set cors_allowed_origins to "*" to allow all origins
socketio = SocketIO(app, cors_allowed_origins="*")

controller = None

@app.route('/')
def index():
    return 'Python web server is running and accepting websocket connections.'

@socketio.on('connect')
def on_connect():
    global controller
    controller = Orbital_Construction()
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

@socketio.on('message')
def on_message(data):
    print('Message received: ', data)
    emit('message', data, broadcast=True)
    
@socketio.on('ping')
def on_ping():
    print('Ping received')
    emit('pong', broadcast=True)

# Add a websocket route for receiving the desired speed for a single robot.
@socketio.on('get_robot_speeds')
def get_robot_speeds(data):
    print(">>>>>>>>>>>>>>>>>>>>>>>>>data",data)
    swarm_speeds = []
    for robot_data in data:
        sensors = robot_data['pythonSensors']
        CONST = robot_data['robotCONST']
        angular_speed_commands = controller.calculate_angular_speed(sensors,CONST)
        angular_speed_and_id = {}
        angular_speed_and_id['id'] = sensors['id']
        angular_speed_and_id['angularSpeed'] = angular_speed_commands
        swarm_speeds.append(angular_speed_and_id)
    emit('robot_speeds', swarm_speeds, broadcast=True)

if __name__ == '__main__': #! app never enters here
    socketio.run(app, debug=True)