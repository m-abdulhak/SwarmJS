#! /bin/bash
echo "running backend"
. /home/arash/Workdir/Research/SwarmJS/.swarmjs/bin/activate
flask --app externalControllerServer.py run

