'use strict';

const delay   = require('delay');
const CPULoad = require('./');

const cpuload = new CPULoad();

(async () => {
    console.log(await CPULoad.measure(1000));
    console.log(await CPULoad.idle(1000));

    cpuload.watch();
    await delay(1200);
    console.log(cpuload.state(), cpuload.idle());
    await delay(1000);
    console.log(cpuload.state(), cpuload.idle());
    cpuload.stopWatch();
    await delay(1000);
    console.log(cpuload.state());
    await delay(5000);
})().catch(e => console.log(e.stack));

