'use strict';

const delay   = require('delay');
const CPULoad = require('./');

const cpuload = new CPULoad();

(async () => {
    console.log(await CPULoad.measure(1000));
    console.log(await CPULoad.idle(1000));

    cpuload.watch();
    console.log(cpuload.state(), cpuload.idle());
    await delay(1200);
    console.log(cpuload.state(), cpuload.idle());
    await delay(1000);
    console.log(cpuload.state(), cpuload.idle());
    cpuload.stopWatch();
    try {
        cpuload.idle();
    }
    catch (e) {
        console.log('Got an error: ' + e.message);        
    }
})().catch(e => console.log(e.stack));

