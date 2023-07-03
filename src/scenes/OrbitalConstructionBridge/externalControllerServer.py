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

@app.route('/')
def index():
    return 'Python web server is running and accepting websocket connections.'

@socketio.on('connect')
def on_connect():
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

@socketio.on('init_py_controller')
def get_robot_speeds(CONST):
    # debugger()
    global controller #!TODO can avoid this
    controller = Orbital_Construction(CONST)
    print("initilized robot controller")


# Add a websocket route for receiving the desired speed for a single robot.
@socketio.on('get_robot_speeds')
def get_robot_speeds(sensors):
    global controller

    # print('=================================================')
    # print('get_robot_speeds: ', data)
    
    # Reply 
    # debugger()
    speed_commands = controller.calculate_speed_command(sensors)
    speeds = {}
    speeds['forwardSpeed'] = 1
    speeds['angularSpeed'] = speed_commands
    emit('robot_speeds', speeds, broadcast=True)

@socketio.on('custom_message')
def get_robot_speeds(data):
    print('custom_message: ', data , type(data))


if __name__ == '__main__': #! app never enters here
    socketio.run(app, debug=True)