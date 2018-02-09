'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _performance = require('./shims/performance.now');

var _performance2 = _interopRequireDefault(_performance);

var _geometry = require('./geometry');

var _IntersectionObserverEntry = require('./IntersectionObserverEntry');

var _IntersectionObserverEntry2 = _interopRequireDefault(_IntersectionObserverEntry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var emptyRect = (0, _geometry.createRectangle)();

/**
 * Tells whether target is a descendant of container element
 * and that both of them are present in DOM.
 *
 * @param {Element} container - Container element.
 * @param {Element} target - Target element.
 * @returns {Boolean}
 */
function isDetached(container, target) {
    var docElement = document.documentElement;

    return container !== docElement && !docElement.contains(container) || !container.contains(target);
}

/**
 * Computes intersection rectangle between two rectangles.
 *
 * @param {ClientRect} rootRect - Rectangle of container element.
 * @param {ClientRect} targetRect - Rectangle of target element.
 * @returns {ClientRect} Intersection rectangle.
 */
function computeIntersection(rootRect, targetRect) {
    var left = Math.max(targetRect.left, rootRect.left);
    var right = Math.min(targetRect.right, rootRect.right);
    var top = Math.max(targetRect.top, rootRect.top);
    var bottom = Math.min(targetRect.bottom, rootRect.bottom);

    var width = right - left;
    var height = bottom - top;

    return (0, _geometry.createRectangle)(left, top, width, height);
}

/**
 * Finds intersection rectangle of provided elements.
 *
 * @param {Element} container - Container element.
 * @param {Element} target - Target element.
 * @param {ClientRect} targetRect - Rectangle of target element.
 * @param {ClientRect} containterRect - Rectangle of container element.
 */
function getIntersection(container, target, containterRect, targetRect) {
    var intersecRect = targetRect,
        parent = target.parentNode,
        rootReached = false;

    while (!rootReached) {
        var parentRect = null;

        if (parent === container || parent.nodeType !== 1) {
            rootReached = true;
            parentRect = containterRect;
        } else if (window.getComputedStyle(parent).overflow !== 'visible') {
            parentRect = (0, _geometry.getRectangle)(parent);
        }

        if (parentRect) {
            intersecRect = computeIntersection(intersecRect, parentRect);
        }

        parent = parent.parentNode;
    }

    return intersecRect;
}

/**
 * This class is responsible for computing and keeping track of intersections
 * between target element and its container. It will create and queue for notification
 * new IntersectionObserverEntry when intersection ratio reaches new thresholded value.
 */

var IntersectionObservation = function () {
    /**
     * Creates instance of IntersectionObservation.
     *
     * @param {Element} target - Element being observed.
     * @param {IntersectionObserver} observer - Associated IntersectionObserver.
     */
    function IntersectionObservation(target, observer) {
        _classCallCheck(this, IntersectionObservation);

        this.target = target;
        this.observer = observer;

        this.prevTargetRect = emptyRect;
        this.prevThreshold = 0;
        this.prevRatio = 0;
    }

    /**
     * Updates intersection data. Creates and queues new
     * IntersectionObserverEntry if intersection threshold has changed.
     *
     * @param {Object} root - Element for which to compute intersection.
     * @param {ClientRect} rootRect - Rectangle of root element.
     * @returns {Object} An object with information about detected changes:
     *  {
     *      ratioChanged: boolean,
     *      targetRectChanged: boolean,
     *      thresholdChanged: boolean
     *  }
     */


    _createClass(IntersectionObservation, [{
        key: 'updateIntersection',
        value: function updateIntersection(root, rootRect) {
            var targetRect = (0, _geometry.getRectangle)(this.target),
                intersection = this.getIntersectionData(root, rootRect, targetRect),
                threshold = +intersection.exists,
                ratioChanged = intersection.ratio !== this.prevRatio,
                targetRectChanged = !(0, _geometry.isEqual)(targetRect, this.prevTargetRect),
                thresholdChanged = void 0;

            // Find thresholds' index if intersection
            // and target rectangles are not empty.
            if (intersection.exists && !(0, _geometry.isEmpty)(targetRect)) {
                threshold = this.observer.getThresholdGreaterThan(intersection.ratio);
            }

            thresholdChanged = threshold !== this.prevThreshold;

            // Update cached properties.
            this.prevTargetRect = targetRect;
            this.prevThreshold = threshold;
            this.prevRatio = intersection.ratio;

            // Create an empty rectangle if there is no intersection.
            if (!intersection.exists) {
                intersection.ratio = 0;
                intersection.rect = emptyRect;
            }

            // Create and queue new entry if threshold has changed.
            if (thresholdChanged) {
                var entry = new _IntersectionObserverEntry2.default(this.target, targetRect, intersection.rect, intersection.ratio, rootRect, (0, _performance2.default)());

                this.observer.queueEntry(entry);
            }

            return { ratioChanged: ratioChanged, thresholdChanged: thresholdChanged, targetRectChanged: targetRectChanged };
        }

        /**
         * Computes intersection data.
         *
         * @param {Element} container - Container element.
         * @param {ClientRect} [containterRect]
         * @param {ClientRect} [targetRect]
         * @returns {Object}
         */

    }, {
        key: 'getIntersectionData',
        value: function getIntersectionData(container, containterRect, targetRect) {
            var target = this.target;

            if (!targetRect) {
                targetRect = (0, _geometry.getRectangle)(this.target);
            }

            if (!containterRect) {
                containterRect = (0, _geometry.getRectangle)(container);
            }

            var detached = isDetached(container, target),
                intersecRect = !detached ? getIntersection(container, target, containterRect, targetRect) : emptyRect,
                intersects = !detached && intersecRect.width >= 0 && intersecRect.height >= 0,
                intersecRatio = (0, _geometry.getArea)(intersecRect) / (0, _geometry.getArea)(targetRect) || 0;

            return {
                rect: intersecRect,
                ratio: intersecRatio,
                exists: intersects
            };
        }
    }]);

    return IntersectionObservation;
}();

exports.default = IntersectionObservation;