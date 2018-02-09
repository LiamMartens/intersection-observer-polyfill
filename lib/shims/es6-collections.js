'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Simple shims for WeakMap and Map classes.
 * This implementation is not meant to be used outside of IntersectionObserver modules
 * because it covers only limited range of use cases.
 */

var hasNativeCollections = typeof window.WeakMap === 'function' && typeof window.Map === 'function';

var WeakMap = function () {
    if (hasNativeCollections) {
        return window.WeakMap;
    }

    /**
     *
     * @param {Array<Array>} arr
     * @param {Object} key
     * @returns {Number}
     */
    function getIndex(arr, key) {
        var result = -1;

        arr.some(function (entry, index) {
            var matches = entry[0] === key;

            if (matches) {
                result = index;
            }

            return matches;
        });

        return result;
    }

    return function () {
        function _class() {
            _classCallCheck(this, _class);

            this.__entries__ = [];
        }

        /**
         *
         * @param {Object} key
         * @returns {*}
         */


        _createClass(_class, [{
            key: 'get',
            value: function get(key) {
                var index = getIndex(this.__entries__, key);

                return this.__entries__[index][1];
            }

            /**
             *
             * @param {Object} key
             * @param {*} value
             */

        }, {
            key: 'set',
            value: function set(key, value) {
                var index = getIndex(this.__entries__, key);

                if (~index) {
                    this.__entries__[index][1] = value;
                } else {
                    this.__entries__.push([key, value]);
                }
            }

            /**
             *
             * @param {Object} key
             */

        }, {
            key: 'delete',
            value: function _delete(key) {
                var entries = this.__entries__,
                    index = getIndex(entries, key);

                if (~index) {
                    entries.splice(index, 1);
                }
            }

            /**
             *
             * @param {Object} key
             * @returns {Boolean}
             */

        }, {
            key: 'has',
            value: function has(key) {
                return !!~getIndex(this.__entries__, key);
            }
        }]);

        return _class;
    }();
}();

var Map = function () {
    if (hasNativeCollections) {
        return window.Map;
    }

    return function (_WeakMap) {
        _inherits(_class2, _WeakMap);

        function _class2() {
            _classCallCheck(this, _class2);

            return _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).apply(this, arguments));
        }

        _createClass(_class2, [{
            key: 'clear',
            value: function clear() {
                this.__entries__.splice(0, this.__entries__.length);
            }

            /**
             *
             * @returns {Array<Array>}
             */

        }, {
            key: 'entries',
            value: function entries() {
                return this.__entries__.slice();
            }

            /**
             *
             * @returns {Array}
             */

        }, {
            key: 'keys',
            value: function keys() {
                return this.__entries__.map(function (entry) {
                    return entry[0];
                });
            }

            /**
             *
             * @returns {Array}
             */

        }, {
            key: 'values',
            value: function values() {
                return this.__entries__.map(function (entry) {
                    return entry[1];
                });
            }

            /**
             *
             * @param {Function} callback
             * @param {Object} [ctx = null]
             */

        }, {
            key: 'forEach',
            value: function forEach(callback) {
                var ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.__entries__[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var entry = _step.value;

                        callback.call(ctx, entry[1], entry[0]);
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
            }
        }, {
            key: 'size',

            /**
             *
             * @returns {Number}
             */
            get: function get() {
                return this.__entries__.length;
            }
        }]);

        return _class2;
    }(WeakMap);
}();

exports.Map = Map;
exports.WeakMap = WeakMap;