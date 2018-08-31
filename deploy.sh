#!/bin/bash
nuxt generate
cp now.json ./dist
cd dist
now && now alias && now rm billtrackr --safe --yes
cd ..
