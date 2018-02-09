'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _es6Collections = require('./shims/es6-collections');

var _geometry = require('./geometry');

var _IntersectionObservation = require('./IntersectionObservation');

var _IntersectionObservation2 = _interopRequireDefault(_IntersectionObservation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Validates and parses threshold values.
 * Throws an error if one of the thresholds
 * is non-finite or not in range of 0 and 1.
 *
 * @param {(Array<Number>|Number)} [thresholds = 0]
 * @returns {Array<Number>} An array of thresholds in ascending order.
 */
function parseThresholds() {
    var thresholds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var result = thresholds;

    if (!Array.isArray(thresholds)) {
        result = [thresholds];
    } else if (!thresholds.length) {
        result = [0];
    }

    return result.map(function (threshold) {
        // We use Number function instead of parseFloat
        // to convert boolean values and null to theirs
        // numeric representation. This is done to act
        // in the same manner as a native implementation.
        threshold = Number(threshold);

        if (!window.isFinite(threshold)) {
            throw new TypeError('The provided double value is non-finite.');
        } else if (threshold < 0 || threshold > 1) {
            throw new RangeError('Threshold values must be between 0 and 1.');
        }

        return threshold;
    }).sort();
}

/**
 * Validates and converts margins value (defined in a form of
 * CSS 'margin' property) to a list of tokens, e.g:
 * 1. '0px' = [['0px'], ['0px'], ['0px'], ['0px']]
 * 2. '5px 11px' = [['5px'], ['11px'], ['5px'], ['11px']]
 *
 * @param {String} [margins = '0px'] - Margins value to be processed.
 * @returns {Array<Array>} Object that contains both: a list of
 *      tokens and its string representation.
 */
function parseMargins() {
    var margins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '0px';

    // Use regular expression in order to properly
    // handle multiple spaces in-between of tokens: '0px     2px   5px'.
    //
    // Casting to a string is required to keep the behavior
    // closer to the native implementation which converts
    // an array like [[['2px 3px']]] to '2px 3px';
    margins = (margins + '').split(/\s+/);

    // Chrome validates tokens length starting from version 53.
    if (margins.length > 4) {
        throw new Error('Extra text found at the end of rootMargin.');
    }

    margins[0] = margins[0] || '0px';
    margins[1] = margins[1] || margins[0];
    margins[2] = margins[2] || margins[0];
    margins[3] = margins[3] || margins[1];

    var rawData = margins.join(' ');

    var parsedData = margins.map(function (token) {
        var _ref = /^(-?\d*\.?\d+)(px|%)$/.exec(token) || [],
            _ref2 = _slicedToArray(_ref, 3),
            value = _ref2[1],
            unit = _ref2[2];

        var pixels = unit === 'px';

        value = parseFloat(value);

        if (!window.isFinite(value)) {
            throw new Error('rootMargin must be specified in pixels or percent.');
        }

        if (!pixels) {
            value /= 100;
        }

        return { value: value, pixels: pixels };
    });

    return { rawData: rawData, parsedData: parsedData };
}

/**
 * Creates new rectangle from provided one whose
 * dimensions will be modified by applying margins
 * defined in a form of [[value: Number, pixels: Boolean], ...].
 *
 * @param {ClientRect} targetRect - Initial rectangle.
 * @param {Array<Array>} margins - Margins data.
 * @returns {ClientRect} Modified rectangle.
 */
function applyMargins(targetRect, margins) {
    margins = margins.map(function (margin, index) {
        var value = margin.value;

        if (!margin.pixels) {
            value *= index % 2 ? targetRect.width : targetRect.height;
        }

        return value;
    });

    var result = {
        top: targetRect.top - margins[0],
        right: targetRect.right + margins[1],
        bottom: targetRect.bottom + margins[2],
        left: targetRect.left - margins[3]
    };

    result.width = result.right - result.left;
    result.height = result.bottom - result.top;

    return result;
}

var IntersectionObserver = function () {
    /**
     * Creates new IntersectionObserver instance.
     *
     * @param {Function} callback - Callback function that will be invoked
     *      whenever one of the observed targets reaches new ratio value defined in "options.threshold".
     * @param {Object} [options = {}] - Optional configuration.
     * @param {IntersectionObserverController} controller - Associated controller instance.
     * @param {IntersectionObserver} publicObserver - This value will be used as
     *      a value of "this" binding for the callback function.
     */
    function IntersectionObserver(callback) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var controller = arguments[2];
        var publicObserver = arguments[3];

        _classCallCheck(this, IntersectionObserver);

        if (typeof callback !== 'function') {
            throw new TypeError("The callback provided as parameter 1 is not a function.");
        }

        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
            throw new TypeError("parameter 2 is not an object.");
        }

        if ('root' in options && !(options.root instanceof Element)) {
            throw new TypeError("member root is not of type Element.");
        }

        var thresholds = parseThresholds(options.threshold);
        var rootMargin = parseMargins(options.rootMargin);

        this.root = options.root || null;
        this.rootMargin = rootMargin.rawData;

        // Thresholds array needs to be immutable
        // according to the native implementation.
        this.thresholds = Object.freeze(thresholds);

        this._root = options.root || document.documentElement;
        this._callback = callback;
        this._rootMargin = rootMargin.parsedData;

        // Registry of observed elements and
        // corresponding IntersectionObservation instances.
        this._targets = new _es6Collections.Map();

        // A list of queued IntersectionObserverEntry
        // items that will passed to the callback function.
        this._quedEntries = [];

        this._publicObserver = publicObserver || this;

        this.controller = controller;
    }

    /**
     * Adds provided target to observations list.
     *
     * @param {Element} target - DOM element to be observed.
     */


    _createClass(IntersectionObserver, [{
        key: 'observe',
        value: function observe(target) {
            if (!arguments.length) {
                throw new TypeError('1 argument required, but only 0 present.');
            }

            if (!(target instanceof Element)) {
                throw new TypeError('parameter 1 is not of type "Element".');
            }

            var targets = this._targets;

            // Do nothing if target is already observed.
            if (targets.has(target)) {
                return;
            }

            // Create new IntersectionObservation instance and assign it
            // to provided target.
            targets.set(target, new _IntersectionObservation2.default(target, this));

            // Connect current observer to controller
            // if it wasn't connected yet.
            if (!this.controller.isConnected(this)) {
                this.controller.connect(this);
            }

            // Request the update of observers.
            this.controller.startUpdateCycle();
        }

        /**
         * Removes provided target from observations list.
         *
         * @param {Element} target - DOM element to stop observing.
         */

    }, {
        key: 'unobserve',
        value: function unobserve(target) {
            if (!arguments.length) {
                throw new TypeError('1 argument required, but only 0 present.');
            }

            if (!(target instanceof Element)) {
                throw new TypeError('parameter 1 is not of type "Element".');
            }

            var targets = this._targets;

            if (targets.has(target)) {
                targets.delete(target);
            }

            // Disconnect observer if the list of observed targets is empty.
            if (!targets.size) {
                this.disconnect();
            }
        }

        /**
         * Removes all targets from observations list
         * and disconnects observer from associated controller, i.e.
         * no updates will be invoked for it.
         */

    }, {
        key: 'disconnect',
        value: function disconnect() {
            this._targets.clear();
            this.controller.disconnect(this);
        }

        /**
         * Returns a list of queued observation entries and
         * clears the queue.
         *
         * @returns {Array}
         */

    }, {
        key: 'takeRecords',
        value: function takeRecords() {
            return this._quedEntries.splice(0);
        }

        /**
         * Invokes callback function with a list
         * of queued entries if the last one is not empty.
         *
         * @private
         */

    }, {
        key: 'notifySubscriber',
        value: function notifySubscriber() {
            var entries = this.takeRecords();
            var publicObserver = this._publicObserver;

            if (entries.length) {
                this._callback.call(publicObserver, entries, publicObserver);
            }
        }

        /**
         * Adds entry to the queue.
         *
         * @param {IntersectionObserverEntry} entry
         */

    }, {
        key: 'queueEntry',
        value: function queueEntry(entry) {
            this._quedEntries.push(entry);
        }

        /**
         * Tells whether observer has queued entries.
         *
         * @returns {Boolean}
         */

    }, {
        key: 'hasEntries',
        value: function hasEntries() {
            return !!this._quedEntries.length;
        }

        /**
         * Updates intersection data of each observed target.
         *
         * @returns {Boolean} Returns "true" if intersection ratio or the rectangle of one of the
         *      observed targets has changed. This information is required for
         *      controller to decide whether to continue running the update cycle.
         */

    }, {
        key: 'updateObservations',
        value: function updateObservations() {
            var root = this._root,
                rootRect = this.getRootRect(),
                hasChanges = false;

            this._targets.forEach(function (observation) {
                var changes = observation.updateIntersection(root, rootRect);

                if (changes.ratioChanged || changes.targetRectChanged) {
                    hasChanges = true;
                }
            });

            return hasChanges;
        }

        /**
         * Finds index of the first threshold whose value is greater than provided ratio.
         * In case if there is no such value the amount of thresholds will be returned.
         *
         * @param {Number} ratio
         * @returns {Number}
         */

    }, {
        key: 'getThresholdGreaterThan',
        value: function getThresholdGreaterThan(ratio) {
            var thresholds = this.thresholds,
                thresholdsLen = thresholds.length,
                index = 0;

            while (index < thresholdsLen && thresholds[index] <= ratio) {
                ++index;
            }

            return index;
        }

        /**
         * Calculates rectangle of root node with applied margins.
         *
         * @returns {ClientRect}
         */

    }, {
        key: 'getRootRect',
        value: function getRootRect() {
            var rootRect = (0, _geometry.getRectangle)(this._root);

            return applyMargins(rootRect, this._rootMargin);
        }
    }]);

    return IntersectionObserver;
}();

exports.default = IntersectionObserver;