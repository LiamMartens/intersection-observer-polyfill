"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
 * A shim for performance.now method which falls back
 * to Date.now if the first one is not supported.
 *
 * @returns {Timestamp}
 */
exports.default = function () {
    if (window.performance && window.performance.now) {
        return function () {
            return window.performance.now();
        };
    }

    return function () {
        return Date.now();
    };
}();