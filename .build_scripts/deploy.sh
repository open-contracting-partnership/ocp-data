#!/usr/bin/env bash
set -e # halt script on error

echo "Get ready, we're pushing to the publish branch!"
cd dist
git init
git config user.name "OCP bot"
git config user.email "ocp-bot@users.noreply.github.com"
git add .
git commit -m "CI deploy to publish"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:publish
