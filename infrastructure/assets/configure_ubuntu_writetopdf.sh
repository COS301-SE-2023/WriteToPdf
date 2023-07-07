#!/bin/bash -xe
# Install OS packages
sudo apt-get update &&
sudo apt-get upgrade -y &&
sudo apt-get install git -y &&
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash &&
. ~/.nvm/nvm.sh &&
nvm install 16.19.1 &&
sudo npm install pm2 -g &&

git clone https://github.com/COS301-SE-2023/WriteToPdf &&
cd WriteToPdf &&
cd backend &&
git switch dev/devOps &&
npm ci &&
npm run pm2:deploy:app