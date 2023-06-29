# Example server that can used to control robots within SwarmJS.

# dependecies:
# pip install Flask Flask-SocketIO
# pip install simple-websocket

from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'

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

# Add a websocket route for receiving the desired speed for a single robot.
@socketio.on('get_robot_speeds')
def get_robot_speeds(data):
    # print('=================================================')
    # print('get_robot_speeds: ', data)
    
    # Reply 
    speeds = {}
    speeds['forwardSpeed'] = 0
    speeds['angularSpeed'] = 0
    emit('robot_speeds', speeds, broadcast=True)

@socketio.on('custom_message')
def get_robot_speeds(data):
    print('custom_message: ', data , type(data))


if __name__ == '__main__':
    socketio.run(app, debug=True)