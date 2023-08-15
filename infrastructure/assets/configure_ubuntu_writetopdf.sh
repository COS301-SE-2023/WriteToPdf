#!/bin/bash -xe
# Install OS packages
sudo apt-get update &&
sudo apt-get upgrade -y &&
sudo apt-get install git chromium-browser -y &&
cd /home/ubuntu/ &&
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash &&
. ~/.nvm/nvm.sh &&
nvm install 16.19.1 &&
npm install pm2 -g &&

git clone https://github.com/COS301-SE-2023/WriteToPdf &&
cd WriteToPdf &&
cd backend &&
git switch main &&
npm ci &&
npm run pm2:deploy:app




## NBNB: sudo apt-get install chromium-browser remeber to install chrome
# args: ["--no-sandbox", "--disabled-setupid-sandbox"],
# executablePath: '/usr/bin/chromium-browser',
# sudo apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget