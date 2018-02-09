'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _geometry = require('./geometry');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IntersectionObserverEntry =
/**
 * Creates new instance of IntersectionObserverEntry.
 *
 * @param {Element} target
 * @param {ClientRect} targetRect
 * @param {ClientRect} intersecRect
 * @param {Number} intersecRatio
 * @param {ClientRect} rootBounds
 * @param {Timestamp} time
 */
function IntersectionObserverEntry(target, targetRect, intersecRect, intersecRatio, rootBounds, time) {
    _classCallCheck(this, IntersectionObserverEntry);

    // According to the spec following properties are not writable and
    // in native implementation they are also not enumerable.
    Object.defineProperties(this, {
        boundingClientRect: { value: targetRect },
        intersectionRatio: { value: intersecRatio },
        intersectionRect: { value: (0, _geometry.mapToClientRect)(intersecRect) },
        rootBounds: { value: (0, _geometry.mapToClientRect)(rootBounds) },
        target: { value: target },
        time: { value: time }
    });
};

exports.default = IntersectionObserverEntry;