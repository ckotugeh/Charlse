"use strict";
export default class Logger {
    constructor() {
        this.loggingEnabled = true;
    }

    log(content) {
        if (this.loggingEnabled) {
            console.log(content);
        }
    }
}