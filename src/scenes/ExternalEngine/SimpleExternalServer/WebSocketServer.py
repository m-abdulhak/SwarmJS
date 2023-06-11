# from levels import AbstractLevel

'''
Provides a connection to the SwarmJS simulator, which will serve as a source of goals 
for each robot.
'''
# Example server that can used to drive robots based on SwarmJS
# dependecies:
# pip install Flask Flask-SocketIO
# pip install simple-websocket

from flask import Flask
from flask_socketio import SocketIO, emit
import eventlet
import threading

eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading') 

envWidth = 600
envHeight = 400
robotPositions = {}
robotGoalsAndWaypoints = {}

# Create a lock for synchronization
lock = threading.Lock()

@app.route('/')
def index():
    return 'Python web server is running and accepting websocket connections.'

@socketio.on('connect')
def on_connect():
    print('Client connected')
    print('sending positions: ', robotPositions)
    emit('robot_positions', robotPositions, broadcast=True)

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

@socketio.on('message')
def on_message(data):
    # print('Message received: ', data)
    emit('message', data, broadcast=True)
    
@socketio.on('ping')
def on_ping():
    # print('Ping received')
    emit('pong', broadcast=True)

# Add a websocket route for receiving the updated goals for a set of robots
@socketio.on('set_goals')
def on_goals(data):
    global robotGoalsAndWaypoints
    
    # print('Goals received: ', data)
    # print('sending positions: ', robotPositions)

    with lock:
        for robotId in data:
            robotGoalsAndWaypoints[robotId] = data[robotId]
        # print('robotGoalsAndWaypoints: ', robotGoalsAndWaypoints)
    
    
    # reply with last known robot positions
    emit('robot_positions', robotPositions, broadcast=True)

# Start Socket.IO server on a separate thread
def start_socketio_server():
    # print('starting server on second thread')
    socketio.run(app, debug=True)

def start_server():
    # print('starting server')

    socketio_thread = threading.Thread(target=start_socketio_server)
    socketio_thread.start()

    # print('server started')
