'use strict';

const delay   = require('delay');
const CPUIdle = require('./');

const cpuIdle = new CPUIdle();

(async () => {
    console.log(await CPUIdle.measure(1000));
    console.log(await CPUIdle.idle(1000));

    cpuIdle.watch();
    console.log(cpuIdle.state(), cpuIdle.idle());
    await delay(1200);
    console.log(cpuIdle.state(), cpuIdle.idle());
    await delay(1000);
    console.log(cpuIdle.state(), cpuIdle.idle());
    cpuIdle.stopWatch();
    try {
        cpuIdle.idle();
    }
    catch (e) {
        console.log('Got an error: ' + e.message);        
    }
})().catch(e => console.log(e.stack));

