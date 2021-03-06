/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/
'use strict';

const winston = require('winston');
const loggers = {};

function createLogger(level, name) {
    // a singleton and default logger
    const {
        config
    } = winston;
    const logger = new winston.Logger({
        level,
        transports: [
            new winston.transports.Console({
                timestamp: () => new Date().toISOString(),
                handleExceptions: true,
                formatter: (options) => {
                    return `${options.timestamp()} ${
                        config.colorize(options.level, options.level.toUpperCase())} ${
                        name ? config.colorize(options.level, `[${name}]`) : ''
                    } ${options.message ? options.message : ''} ${
                        options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : ''}`;
                }
            })
        ],
        exitOnError: false
    });
    return logger;
}

const levelMapping = (level) => {
    let loglevel = 'info';
    if (typeof level === 'string') {
        switch (level.toUpperCase()) {
            case 'CRITICAL':
                loglevel = 'fatal';
                break;
            case 'ERROR':
                loglevel = 'error';
                break;
            case 'WARNING':
                loglevel = 'warn';
                break;
            case 'DEBUG':
                loglevel = 'debug';
                break;
            case 'INFO':
                loglevel = 'info';
        }
    }
    return loglevel;
};

module.exports.getLogger = function (name = '') {
    // set the logging level based on the environment variable
    // configured by the peer
    const loglevel = levelMapping(process.env.CORE_CHAINCODE_LOGGING_SHIM);
    let logger;

    if (loggers[name]) {
        logger = loggers[name];
        logger.level = loglevel;
    } else {
        logger = createLogger(loglevel, name);
        loggers[name] = logger;
    }

    return logger;
};

module.exports.setLevel = (level) => {
    // set the level of all the loggers currently active
    const loglevel = levelMapping(level);
    process.env.CORE_CHAINCODE_LOGGING_SHIM = loglevel;

    Object.keys(loggers).forEach((name) => {
        loggers[name].level = loglevel;
    });
};

