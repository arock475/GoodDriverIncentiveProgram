#!/bin/bash
# Ideally this should run in ~/

# Can specify branch name to serve as param, defaults to main
BRANCH_NAME=${1:-main}

GIT_REPO_URL="https://S23-Team25-Bowlin-Adomatis-Clark-Redler-Spears@dev.azure.com/S23-Team25-Bowlin-Adomatis-Clark-Redler-Spears/S23-Team25-Bowlin.Adomatis.Clark.Spears.Redler/_git/S23-Team25-Bowlin.Adomatis.Clark.Spears.Redler"
RUN_FRONTEND_CMD="cd ~/app/application/frontend && npm install && npm start"
RUN_BACKEND_CMD="cd ~/app/application/backend && go build && ./api"


# Close any existing frontend/backend screen sessions that are running
screen -X -S frontend quit
screen -X -S backend quit


# Delete any existing folder and clone repo and checkout to branch param
cd ~/
rm -rf app/
git clone $GIT_REPO_URL app
cd app
git checkout $BRANCH_NAME

# Start two separate screens for the backend and frontend.
screen -dmS frontend bash -c "$RUN_FRONTEND_CMD"
screen -dmS backend bash -c "$RUN_BACKEND_CMD"

echo "Cloned repo and began running. Please wait a moment for it to serve."
echo "You can connect to the frontend or backend terminals with screen."