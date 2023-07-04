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
def init_py_controller(CONST):

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
    if controller is None:
        print("controller not initilized")
        return
    speed_commands = 0

    angular_speed_commands = controller.calculate_speed_command(sensors)
    # print(">>>>> sensors:", type(sensors) , sensors , "<<<<")
    # print("\n -> CONST:", controller.CONST ,"<-/n")

    speeds = {}
    speeds['forwardSpeed'] = controller.CONST.maxForwardSpeed 
    speeds['angularSpeed'] = angular_speed_commands
    # print("python ordered speed:" ,speeds)
    emit('robot_speeds', speeds, broadcast=True)

@socketio.on('custom_message')
def get_robot_speeds(data):
    print('custom_message: ', data , type(data))


if __name__ == '__main__': #! app never enters here
    socketio.run(app, debug=True)