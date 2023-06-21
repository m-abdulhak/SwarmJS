# Example server that can used to drive robots based on SwarmJS
# dependecies:
# pip install Flask Flask-SocketIO
# pip install simple-websocket

from flask import Flask
from flask_socketio import SocketIO, emit
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'

# Set cors_allowed_origins to "*" to allow all origins
socketio = SocketIO(app, cors_allowed_origins="*")

envWidth = 600
envHeight = 400
robotPositions = {
    '0': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '1': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '2': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '3': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '4': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '5': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '6': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '7': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '8': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '9': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '10': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '11': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '12': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '13': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '14': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '15': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '16': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '17': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '18': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '19': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '20': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '21': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '22': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '23': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '24': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '25': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '26': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '27': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '28': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '29': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
    '30': {'x': random.randint(0, envWidth), 'y': random.randint(0, envHeight)},
}
robotGoalsAndWaypoints = {}

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

# Add a websocket route for receiving the updated goals for a set of robots
@socketio.on('set_goals')
def on_goals(data):
    global robotGoalsAndWaypoints    
    robotGoalsAndWaypoints = data
    
    print('=================================================')
    print('Goals received: ', data)
    
    # simulate robot movement (in real case should retrieved from actual robots)
    for robotId in data:
        robotWaypoint = data[robotId]['waypoint']
        robotPosition = robotPositions[robotId]
        if (robotPosition == None):
            robotPosition = {'x': 0, 'y': 0}
        robotPosition['x'] = robotPosition['x'] + (robotWaypoint['x'] - robotPosition['x']) / 50
        robotPosition['y'] = robotPosition['y'] + (robotWaypoint['y'] - robotPosition['y']) / 50
        robotPositions[robotId] = robotPosition
    
    # reply with last known robot positions
    emit('robot_positions', robotPositions, broadcast=True)
    print('Robot positions sent: ', data)

if __name__ == '__main__':
    socketio.run(app, debug=True)