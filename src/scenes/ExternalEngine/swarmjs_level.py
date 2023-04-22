# from wbSocket import start_server

# robotPositions = {}
# robotGoalsAndWaypoints = {}

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

logging = False

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
    print('Message received: ', data)
    emit('message', data, broadcast=True)
    
@socketio.on('ping')
def on_ping():
    print('Ping received')
    emit('pong', broadcast=True)

# Add a websocket route for receiving the updated goals for a set of robots
@socketio.on('set_goals')
def on_goals(data):
    global robotGoalsAndWaypoints
    
    if logging:
        print('=================================================')
        print('Goals received: ', data)

    with lock:
        for robotId in data:
            robotGoalsAndWaypoints[robotId] = data[robotId]
            
        if logging:
            print('robotGoalsAndWaypoints: ', robotGoalsAndWaypoints)
    
    
    # reply with last known robot positions    
    if logging:
        print('sending positions: ', robotPositions)

    emit('robot_positions', robotPositions, broadcast=True)

# Start Socket.IO server on a separate thread
def start_socketio_server():
    print('starting server on second thread')
    socketio.run(app, debug=False)

def start_server():
    print('starting server')
    socketio_thread = threading.Thread(target=start_socketio_server)
    socketio_thread.start()
    print('server started')

class SwarmJSLevel():
    def __init__(self, ADD_ANY_NECESSARY_PARAMS_LIKE_WIDTH_OR_HEIGHT):
        # Start Server to allow SwarmJS to connect
        start_server()
        pass
    
    def get_journey_dict(self, manual_movement, wow_tags):
        # Should return a dictionary where the keys are integer id's (the id of each tag)
        # and the values are the (goal_x, goal_y) positions.
        # Ignore 'manual_movement'.
        self.journey_dict = {}
        global robotPositions
        newPositions = {}

        # print('iterating wow_tags, current goals', robotGoalsAndWaypoints)

        for wow_tag in wow_tags:
            strId = str(wow_tag.id)
            newPositions[strId] = { 'x': wow_tag.x, 'y': wow_tag.y, 'angle': wow_tag.angle}
            if strId in robotGoalsAndWaypoints:
                self.journey_dict[wow_tag.id] = (wow_tag.x, wow_tag.y, wow_tag.angle, robotGoalsAndWaypoints[strId]['waypoint']['x'], robotGoalsAndWaypoints[strId]['waypoint']['y'])
            else:
                if logging:
                    print('goal for robot ', wow_tag.id, ' not found')

        robotPositions = newPositions
        return self.journey_dict