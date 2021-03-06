'use strict';

const _       = require('lodash');
const assert  = require('assert');
const debug   = require('debug')('cpu-idle');
const delay   = require('delay');
const os      = require('os');

const cpus    = os.cpus().length;
const DEFAULT_NAME = 'default';
const DEFAULTS  = {
    measure_duration: 1000,
};
const PRECISION = 10000;
const CONFIG          = Symbol('CONFIG');
const TIMES_TO_IDLE   = Symbol('TIMES_TO_IDLE');
const WATCHES         = Symbol('WATCHES');
const MEASURE_WATCH_NEXT  = Symbol('MEASURE_WATCH_NEXT');

class CPUIdle {

    constructor(config = {}) {
        assert(config instanceof Object, 'Invalid type of config, should be an object');
        this[CONFIG] = _.cloneDeep(config);
        this[CONFIG] = _.defaultsDeep(this[CONFIG], DEFAULTS);
        this[WATCHES] = {};
    }

    /**
     * watch(name, duration)
     * watch({ name => duration, ... })
     **/
    watch(durations = { [DEFAULT_NAME]: DEFAULTS.measure_duration }, duration = null) {
        if (null !== duration) {
            durations = { [durations]: duration };
        }
        assert(durations instanceof Object, 'Measurements should be an object(name => measure duration)');
        for (const name in durations) {
            const duration = durations[name];
            assert(Number.isInteger(duration) && duration > 0,
                `duration(${duration}) should be a positive integer`);
            debug(`start watching ${name}`);
            this.stopWatch(name);
            this[WATCHES][name] = {
                duration,
                state: {},
            }
            this[MEASURE_WATCH_NEXT](name).catch(e => { throw e; });
        }
    }

    stopWatch(...names) {
        if (names.length === 0) {
            names = [DEFAULT_NAME];
        }
        for (const name of names) {
            if (!this[WATCHES].hasOwnProperty(name)) {
                continue;
            }
            debug(`stop watching ${name}`);
            delete this[WATCHES][name];
        }
        return this;
    }

    async [MEASURE_WATCH_NEXT](name) {
        debug(`measuring watch ${name} next loop...`);
        if (!this[WATCHES].hasOwnProperty(name)) {
            return;
        } 
        const duration = this[WATCHES][name].duration;
        const state = await this.measure(duration);
        if (!this[WATCHES].hasOwnProperty(name) || this[WATCHES][name].duration !== duration) {
            return;
        }
        this[WATCHES][name].state = state;
        const next = setTimeout(() => this[MEASURE_WATCH_NEXT](name).catch(e => { throw e; }), 0);
        next.unref();
    }

    state(name = DEFAULT_NAME) {
        const state = this[WATCHES][name] && this[WATCHES][name].state;
        if (!state) {
            throw new Error('Can not get state before watching');
        }
        return state;
    }

    idle(name = DEFAULT_NAME) {
        const state = this.state(name);
        return CPUIdle[TIMES_TO_IDLE](state);
    }

    async measure(duration) {
        duration = duration || this[CONFIG].measure_duration;
        return CPUIdle.measure(duration);
    }

    static async measure(duration) {
        assert(Number.isInteger(duration) && duration > 0,
            `duration(${duration}) should be a positive integer`);
        debug(`measure, duration = ${duration}`);
        const startTimes = cputimes();
        await delay(duration);
        const endTimes = cputimes();
        const times = {
            total: getIncrement(startTimes.total, endTimes.total),
            idle: getIncrement(startTimes.idle, endTimes.idle),
        };
        return {
            ...times,
            duration,
            cpus,
        };
    }

    static async idle(duration = DEFAULT_MEASURE_DURATION) {
        const times = await CPUIdle.measure(duration);
        return CPUIdle[TIMES_TO_IDLE](times);
    }

    static [TIMES_TO_IDLE](times) {
        if (!(times instanceof Object)
            || !Number.isInteger(times.idle) || times.idle <= 0
            || !Number.isInteger(times.total) || times.total <= 0) {
            return 0.0;
        }
        const percent = Math.round(PRECISION * times.idle / times.total) / PRECISION;
        return percent;
    }

}

function cputimes() {
    let total = 0;
    let idle = 0;
    const cpus = os.cpus();
    for (const cpu of cpus) {
        total += _.chain(cpu.times).values().sum().value();
        idle += cpu.times.idle;
    }
    debug(`get cpu times, total = ${total}, idle = ${idle}`);
    return { total, idle };
}

function getIncrement(from, to) {
    const increment = from < to ? to - from : Math.MAX_SAFE_INTEGER - from + to;
    return increment;
}

module.exports = CPUIdle;
