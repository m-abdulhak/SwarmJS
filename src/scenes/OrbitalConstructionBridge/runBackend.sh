#! /bin/bash
echo "running backend"
. ../../../.swarmjs/bin/activate
flask --app externalControllerServer.py run

