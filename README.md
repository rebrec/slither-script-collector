# slither-script-collector

Script aimed at tracking script modification of the main slitherio game script.

## Installation

use nvm or node, but i prefer nvm

npm install

## Usage

nvm run ./src/collector.js

Then every 10 minutes (by default) a check will be done, if the file is different than previous one, it will be saved with a timestamp inside data folder