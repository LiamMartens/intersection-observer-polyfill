'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _es6Collections = require('./shims/es6-collections');

var _IntersectionObserverController = require('./IntersectionObserverController');

var _IntersectionObserverController2 = _interopRequireDefault(_IntersectionObserverController);

var _IntersectionObserver2 = require('./_IntersectionObserver');

var _IntersectionObserver3 = _interopRequireDefault(_IntersectionObserver2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// This controllers' instance will be assigned to all IntersectionObservers
var controller = new _IntersectionObserverController2.default();

// Registry of internal observers.
var observers = new _es6Collections.WeakMap();

/**
 * IntersectionObservers' "Proxy" class which is meant to hide private
 * properties and methods from IntersectionObserver instances.
 *
 * Additionally it implements "idleTimeout" and "trackHovers" static property
 * accessors to give a control over the behavior of IntersectionObserverController
 * instance. Changes made to these properties will affect both future and
 * existing instances of IntersectionObserver.
 */

var IntersectionObserver = function () {
    /**
     * Creates instance of public IntersectionObserver.
     *
     * @param {Function} callback
     * @param {Object} options
     */
    function IntersectionObserver(callback, options) {
        _classCallCheck(this, IntersectionObserver);

        if (!arguments.length) {
            throw new TypeError("1 argument required, but only 0 present.");
        }

        var observer = new _IntersectionObserver3.default(callback, options, controller, this);

        // Due to the spec following properties are non-writable
        // and in native implementation they are also not enumerable.
        Object.defineProperties(this, {
            root: { value: observer.root },
            thresholds: { value: observer.thresholds },
            rootMargin: { value: observer.rootMargin }
        });

        // Register internal observer.
        observers.set(this, observer);
    }

    /**
     * Extracts controllers' idle timeout value.
     *
     * @returns {Number}
     */


    _createClass(IntersectionObserver, null, [{
        key: 'idleTimeout',
        get: function get() {
            return controller.idleTimeout;
        }

        /**
         * Sets up new idle timeout.
         *
         * @param {Number} value - New timeout value.
         */
        ,
        set: function set(value) {
            if (typeof value !== 'number') {
                throw new TypeError('type of "idleTimeout" value must be a number.');
            }

            if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) < 0) {
                throw new TypeError('"idleTimeout" value must be greater than 0.');
            }

            controller.idleTimeout = value;
        }

        /**
         * Tells whether controller tracks "hover" events.
         *
         * @returns {Boolean}
         */

    }, {
        key: 'trackHovers',
        get: function get() {
            return controller.isHoverEnabled();
        }

        /**
         * Enables or disables tracking of "hover" event.
         *
         * @param {Boolean} value - Whether to disable or enable tracking.
         */
        ,
        set: function set(value) {
            if (typeof value !== 'boolean') {
                throw new TypeError('type of "trackHovers" value must be a boolean.');
            }

            value ? controller.enableHover() : controller.disableHover();
        }
    }]);

    return IntersectionObserver;
}();

// Expose public methods of IntersectionObserver.


['observe', 'unobserve', 'disconnect', 'takeRecords'].forEach(function (method) {
    IntersectionObserver.prototype[method] = function () {
        var _observers$get;

        return (_observers$get = observers.get(this))[method].apply(_observers$get, arguments);
    };
});

exports.default = IntersectionObserver;