# This is a demonstration of adding support for driving real robots with SwarmJS

# Server

Run server.py with 'python server.py'. Check the top of the file for dependencies that might need to be installed first.

This script simulates an external server that provides SwarmJS with live robot positions through a WebSocket connection and receives robot goals from SwarmJS as calculated by the controller defined in the running scene.

# SwarmJS With External Engine

Scene configurations should be updated to reflect the use of an external engine instead of the internal physics engine.
The URL of the external server must be provided in the configuration, and the updateInterval is optional (defaults to 100 ms).
