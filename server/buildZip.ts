/** @format */

import AdmZip from 'adm-zip';
import yargs = require('yargs/yargs');

import pkg from '../package.json';

interface Arguments {
    [x: string]: unknown;
    extensionVersion: string;
}

const args = yargs(process.argv.slice(2)).options({
    extensionVersion: { type: 'string' },
}).argv as Arguments;

const extensionVersion = args?.extensionVersion || `v${pkg.version}`;

const file = new AdmZip();
file.addLocalFolder('./extension/gen-sdk-model');
file.writeZip(`./extension/gen-sdk-model-${extensionVersion}.zip`);
