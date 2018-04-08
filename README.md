# cpuload
Get cpu load info

# Usage

Measure the cpu load directly

```
const CPULoad = require('cpuload');

const idle = await CPULoad.idle(1000); // get the average load in the last 1000ms

const detail = await CPULoad.measure(1000); // get the detailed cpu times in the last 1000ms
```

Get the cpu load instantly

```
const CPULoad = require('cpuload');

const cpuload = new CPULoad();
cpuload.watch();

await delay(5000);

const idle = cpuload.idle();
```
