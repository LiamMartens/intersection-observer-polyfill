'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _performance = require('./shims/performance.now');

var _performance2 = _interopRequireDefault(_performance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mutationsSupported = typeof window.MutationObserver === 'function';

/**
 * A shim for requestAnimationFrame which falls back
 * to setTimeout if the first one is not supported.
 *
 * @returns {Number} Request identifier.
 */
var requestAnimFrame = function () {
    if (window.requestAnimationFrame) {
        return window.requestAnimationFrame;
    }

    return function (callback) {
        return setTimeout(function () {
            return callback((0, _performance2.default)());
        }, 1000 / 60);
    };
}();

/**
 * Creates a wrapper function that ensures that
 * provided callback will be invoked only after
 * the specified delay.
 *
 * @param {Function} callback
 * @param {Number} [delay = 0]
 * @returns {Function}
 */
function debounce(callback) {
    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var timeoutID = false;

    return function () {
        var _this = this;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (timeoutID !== false) {
            clearTimeout(timeoutID);
        }

        timeoutID = setTimeout(function () {
            timeoutID = false;

            callback.apply(_this, args);
        }, delay);
    };
}

/**
 * Controller class that is used to handle updates of registered IntersectionObservers.
 * It controls when and for how long it's necessary to run updates of observations
 * by listening to various events on window along with DOM mutations
 * (nodes removal, changes of attributes, etc.).
  *
 * CSS transitions and animations are handled by running the update cycle
 * until position of DOM elements, added to connected observers, keeps changing
 * or until the idle timeout is reached (default timeout is 50 milliseconds).
 * Timeout value can be manually increased if transitions have a delay.
 *
 * Tracking of changes made by ":hover" class is optional and can be
 * enabled by invoking the "enableHover" method.
 *
 * Infinite update cycle along with a listener of "click" event will be used in case when
 * MutatioObserver is not supported.
 */

var IntersectionObserverController = function () {
    /**
     * Creates new IntersectionObserverController instance.
     *
     * @param {Number} [idleTimeout = 50]
     * @pram {Boolean} [trackHovers = false] - Whether to track "mouseover"
     *      events or not. Disabled be default.
     */
    function IntersectionObserverController() {
        var idleTimeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;
        var trackHovers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, IntersectionObserverController);

        this._idleTimeout = idleTimeout;
        this._trackHovers = trackHovers;
        this._cycleStartTime = -1;

        // Indicates whether the update of observers is scheduled.
        this._isUpdateScheduled = false;

        // Indicates whether infinite cycles are enabled.
        this._repeatCycle = false;

        // Indicates whether "mouseover" event handler was added.
        this._hoverInitiated = false;

        // Keeps reference to the instance of MutationObserver.
        this._mutationsObserver = null;

        // Indicates whether DOM listeners were initiated.
        this._isListening = false;

        // A list of connected observers.
        this._observers = [];

        // Fix value of "this" binding for the following methods.
        this.startUpdateCycle = this.startUpdateCycle.bind(this);
        this.scheduleUpdate = this.scheduleUpdate.bind(this);
        this._onMutation = this._onMutation.bind(this);

        // Function that will be invoked to re-rerun the update cycle
        // if repeatable cycles are enabled.
        this._repeatHandler = debounce(this.scheduleUpdate, 200);

        // "mouseover" event handler.
        this._onMouseOver = debounce(this.startUpdateCycle, 200);
    }

    /**
     * Returns current idle timeout value.
     *
     * @returns {Number}
     */


    _createClass(IntersectionObserverController, [{
        key: 'connect',


        /**
         * Adds observer to observers list.
         *
         * @param {IntersectionObserver} observer - Observer to be added.
         */
        value: function connect(observer) {
            if (!this.isConnected(observer)) {
                this._observers.push(observer);
            }

            // Instantiate listeners if they
            // weren't instantiated yet.
            if (!this._isListening) {
                this._initListeners();
            }
        }

        /**
         * Removes observer from observers list.
         *
         * @param {IntersectionObserver} observer - Observer to be removed.
         */

    }, {
        key: 'disconnect',
        value: function disconnect(observer) {
            var observers = this._observers,
                index = observers.indexOf(observer);

            if (~index) {
                observers.splice(index, 1);
            }

            // Remove listeners if controller
            // has no connected observers.
            if (!observers.length && this._isListening) {
                this._removeListeners();
            }
        }

        /**
         * Tells whether provided observer is connected to controller.
         *
         * @param {IntersectionObserver} observer - Observer to be checked.
         * @returns {Boolean}
         */

    }, {
        key: 'isConnected',
        value: function isConnected(observer) {
            return !!~this._observers.indexOf(observer);
        }

        /**
         * Updates every observer from observers list and
         * notifies them of queued entries.
         *
         * @private
         * @returns {Boolean} Returns "true" if any observer
         *      has detected changes in position of its elements.
         */

    }, {
        key: '_updateObservers',
        value: function _updateObservers() {
            var hasChanges = false;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._observers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var observer = _step.value;

                    if (observer.updateObservations()) {
                        hasChanges = true;
                    }

                    if (observer.hasEntries()) {
                        observer.notifySubscriber();
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return hasChanges;
        }

        /**
         * Schedules new update cycle.
         */

    }, {
        key: 'startUpdateCycle',
        value: function startUpdateCycle() {
            this._cycleStartTime = (0, _performance2.default)();

            this.scheduleUpdate();
        }

        /**
         * Controls invocation of "_updateObservers" method.
         * It will re-invoke itself in the following cases:
         *      - Update of observers detected changes in elements position.
         *        In this case we need to postpone cycle end time in order to ensure
         *        that we won't miss next iteration of animations.
         *
         *      - Idle timeout wasn't reached yet.
         *        In this case we need to schedule new single update
         *        because changes may be delayed.
         *
         * @param {Number} [timestamp] - Internal parameter
         *      that is used to define whether method was invoked
         *      as a callback of requestAnimationFrame.
         */

    }, {
        key: 'scheduleUpdate',
        value: function scheduleUpdate(timestamp) {
            var calledFromRAF = typeof timestamp === 'number';

            // Invoke the update of observers only if function
            // was called as a requestAnimationFrame callback.
            if (calledFromRAF) {
                var hasChanges = this._updateObservers();

                this._isUpdateScheduled = false;

                // Do nothing if cycle wasn't started.
                if (!this._wasCycleStarted()) {
                    return;
                }

                if (hasChanges) {
                    // Postpone cycle end time if changes were detected.
                    this.startUpdateCycle();
                } else if (!this._hasIdleTimeEnded()) {
                    // Schedule new single update if cycle timeout wasn't reached yet.
                    this.scheduleUpdate();
                } else {
                    // Finish cycle.
                    this._onCycleEnded();
                }
            } else if (!this._isUpdateScheduled) {
                // Request new update if it wasn't requested already.
                requestAnimFrame(this.scheduleUpdate);

                this._isUpdateScheduled = true;
            }
        }

        /**
         * Tells whether cycle has reached its idle timeout.
         *
         * @private
         * @returns {Boolean}
         */

    }, {
        key: '_hasIdleTimeEnded',
        value: function _hasIdleTimeEnded() {
            return (0, _performance2.default)() - this._cycleStartTime > this._idleTimeout;
        }

        /**
         * Tells whether the update cycle is currently running.
         *
         * @private
         * @returns {Boolean}
         */

    }, {
        key: '_wasCycleStarted',
        value: function _wasCycleStarted() {
            return this._cycleStartTime !== -1;
        }

        /**
         * Callback that will be invoked after the update cycle is finished.
         *
         * @private
         */

    }, {
        key: '_onCycleEnded',
        value: function _onCycleEnded() {
            // Mark that update cycle is not running.
            this._cycleStartTime = -1;

            if (this._repeatCycle) {
                // Time is set to '0' because we want to automatically
                // start update cycle when single update detects changes.
                this._cycleStartTime = 0;

                this._repeatHandler();
            }
        }

        /**
         * Initializes DOM listeners.
         *
         * @private
         */

    }, {
        key: '_initListeners',
        value: function _initListeners() {
            // Do nothing if listeners are already initiated.
            if (this._isListening) {
                return;
            }

            this._isListening = true;

            // Use update cycle here instead of a single update because we may encounter
            // with delayed changes, e.g. when width or height of an
            // element are changed by CSS transitions.
            window.addEventListener('resize', this.startUpdateCycle, true);

            window.addEventListener('scroll', this.scheduleUpdate, true);

            // Listen to possible changes made by ":hover" class.
            if (this._trackHovers) {
                this._addHoverListener();
            }

            // Fall back to repeatable cycle with additional tracking of
            // "click" event if MutationObserver is not supported.
            if (!mutationsSupported) {
                this._repeatCycle = true;

                // Listen to clicks as they may cause changes in elements position.
                window.addEventListener('click', this.startUpdateCycle, true);

                // Manually start cycle.
                this.startUpdateCycle();
            } else {
                // Subscribe to DOM mutations as they may lead to changes in position of elements.
                this._mutationsObserver = new MutationObserver(this._onMutation);

                this._mutationsObserver.observe(document, {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        }

        /**
         * Removes all DOM listeners.
         *
         * @private
         */

    }, {
        key: '_removeListeners',
        value: function _removeListeners() {
            // Do nothing if listeners were already removed.
            if (!this._isListening) {
                return;
            }

            window.removeEventListener('resize', this.startUpdateCycle, true);
            window.removeEventListener('scroll', this.scheduleUpdate, true);

            this._removeHoverListener();

            if (!mutationsSupported) {
                this._repeatCycle = false;

                window.removeEventListener('click', this.startUpdateCycle, true);
            } else if (this._mutationsObserver) {
                this._mutationsObserver.disconnect();
                this._mutationsObserver = null;
            }

            this._isListening = false;
        }

        /**
         * Enables hover listener.
         */

    }, {
        key: 'enableHover',
        value: function enableHover() {
            this._trackHovers = true;

            // Manually add hover listener
            // if listeners were already initiated.
            if (this._isListening) {
                this._addHoverListener();
            }
        }

        /**
         * Disables hover listener.
         */

    }, {
        key: 'disableHover',
        value: function disableHover() {
            this._trackHovers = false;

            this._removeHoverListener();
        }

        /**
         * Tells whether hover listener is enabled.
         *
         * @returns {Boolean}
         */

    }, {
        key: 'isHoverEnabled',
        value: function isHoverEnabled() {
            return this._trackHovers;
        }

        /**
         * Adds "mouseover" listener if it wasn't already added.
         *
         * @private
         */

    }, {
        key: '_addHoverListener',
        value: function _addHoverListener() {
            if (this._hoverInitiated) {
                return;
            }

            window.addEventListener('mouseover', this._onMouseOver, true);

            this._hoverInitiated = true;
        }

        /**
         * Removes "mouseover" listener if it was added previously.
         *
         * @private
         */

    }, {
        key: '_removeHoverListener',
        value: function _removeHoverListener() {
            if (!this._hoverInitiated) {
                return;
            }

            window.removeEventListener('mouseover', this._onMouseOver, true);

            this._hoverInitiated = false;
        }

        /**
         * DOM mutations handler.
         *
         * @private
         * @param {Array<MutationRecord>} entries
         */

    }, {
        key: '_onMutation',
        value: function _onMutation(entries) {
            var runSingleUpdate = entries.every(function (entry) {
                return entry.type !== 'attributes';
            });

            // Schedule single update if attributes (class, style, etc.)
            // were not changed. Otherwise run update cycle because
            // animations are expected to appear only in this case.
            runSingleUpdate ? this.scheduleUpdate() : this.startUpdateCycle();
        }
    }, {
        key: 'idleTimeout',
        get: function get() {
            return this._idleTimeout;
        }

        /**
         * Sets up new idle timeout value.
         *
         * @param {Number} value - New timeout value.
         */
        ,
        set: function set(value) {
            this._idleTimeout = value;
        }
    }]);

    return IntersectionObserverController;
}();

exports.default = IntersectionObserverController;