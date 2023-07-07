#! /bin/bash
echo "running backend"
. ./.swarmjs/bin/activate
flask --app src/scenes/OrbitalConstructionBridge/externalControllerServer.py run

