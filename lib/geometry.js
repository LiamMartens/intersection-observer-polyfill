"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mapToClientRect = mapToClientRect;
exports.createRectangle = createRectangle;
exports.getRectangle = getRectangle;
exports.getArea = getArea;
exports.isEmpty = isEmpty;
exports.isEqual = isEqual;
/**
 * From provided rectangle creates a new one whose
 * properties are not enumerable, configurable or writable.
 *
 * @param {ClientRect} rect - Initial rectangle.
 * @returns {ClientRect}
 */
function mapToClientRect(rect) {
    var descriptors = {};

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(rect)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            descriptors[key] = { value: rect[key] };
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

    return Object.defineProperties({}, descriptors);
}

/**
 * Creates rectangle based on provided arguments.
 * If called without arguments then an empty rectangle
 * will be created.
 *
 * @param {Number} [left = 0] - Left position of rectangle.
 * @param {Number} [top = 0] - Top position of rectangle.
 * @param {Number} [width = 0] - Rectangles' width.
 * @param {Number} [height = 0] - Rectangles' height.
 * @returns {ClientRect}
 */
function createRectangle() {
    var left = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var width = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var height = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    return {
        left: left, top: top, width: width, height: height,
        bottom: top + height,
        right: left + width
    };
}

/**
 * Returns client rectangle of provided element.
 * If element represents documentElement then returns
 * main viewport rectangle.
 *
 * @param {Element} target
 * @returns {ClientRect}
 */
function getRectangle(target) {
    if (target === document.documentElement) {
        return createRectangle(0, 0, target.clientWidth, target.clientHeight);
    }

    return target.getBoundingClientRect();
}

/**
 * Calculates area of rectangle.
 *
 * @param {ClientRect} rect - Rectangle whose area needs to be calculated.
 * @returns {Number} Rectangles' area.
 */
function getArea(rect) {
    return rect.width * rect.height;
}

/**
 * Tells whether rectangle is empty.
 *
 * @param {ClientRect} rect - Rectangle to be checked.
 * @returns {Boolean}
 */
function isEmpty(rect) {
    return rect.height === 0 && rect.width === 0;
}

/**
 * Compares rectangles to each other.
 *
 * @param {ClientRect} first
 * @param {ClientRect} second
 * @returns {Boolean}
 */
function isEqual(first, second) {
    return first.top === second.top && first.left === second.left && first.right === second.right && first.bottom === second.bottom;
}