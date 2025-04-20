const moment = require('moment-timezone')

moment.tz.setDefault("Asia/Jakarta");

const funcs = {
    log: console.info.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: (console.debug || console.info).bind(console),
};

const logLevels = {
    log: "LOG",
    info: "INFO",
    warn: "WARN",
    error: "ERROR",
    debug: "DEBUG",
};

Object.keys(funcs).forEach((k) => {
    const key = k;

    console[key] = (...args) => {
        const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
        const logStatus = logLevels[key];

        if (typeof args[0] === "string") {
            args[0] = `[${logStatus}] ${timestamp} ${args[0]}`;
        } else {
            args.unshift(`[${logStatus}] ${timestamp} `);
        }

        funcs[key].apply(console, args);
    };
});
