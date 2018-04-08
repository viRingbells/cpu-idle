# CPU Idle
Get cpu load info

# Usage

Measure the cpu load directly

```
const CPUIdle = require('cpu-idle');

const idle = await CPUIdle.idle(1000); // get the average load in the last 1000ms

const detail = await CPUIdle.measure(1000); // get the detailed cpu times in the last 1000ms
```

Get the cpu load instantly

```
const CPUIdle = require('cpu-idle');

const cpuIdle = new CPUIdle();
cpuIdle.watch();

await delay(5000);

const idle = cpuIdle.idle();
```
