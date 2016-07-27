'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

exports.effectToPromise = effectToPromise;
exports.isEffect = isEffect;
exports.isNone = isNone;
exports.none = none;
exports.promise = promise;
exports.call = call;
exports.batch = batch;
exports.constant = constant;
exports.lift = lift;

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var isEffectSymbol = (0, _symbol2['default'])('isEffect');

var effectTypes = {
  PROMISE: 'PROMISE',
  CALL: 'CALL',
  BATCH: 'BATCH',
  CONSTANT: 'CONSTANT',
  NONE: 'NONE',
  LIFT: 'LIFT'
};

/**
* Runs an effect and returns the Promise for its completion.
* @param {Object} effect The effect to convert to a Promise.
* @returns {Promise} The converted effect Promise.
*/
function effectToPromise(effect) {
  if (process.env.NODE_ENV === 'development') {
    (0, _utils.throwInvariant)(isEffect(effect), 'Given effect is not an effect instance.');
  }

  switch (effect.type) {
    case effectTypes.PROMISE:
      return effect.factory.apply(effect, (0, _toConsumableArray3['default'])(effect.args)).then(function (action) {
        return [action];
      });
    case effectTypes.CALL:
      return _promise2['default'].resolve([effect.factory.apply(effect, (0, _toConsumableArray3['default'])(effect.args))]);
    case effectTypes.BATCH:
      return _promise2['default'].all(effect.effects.map(effectToPromise)).then(_utils.flatten);
    case effectTypes.CONSTANT:
      return _promise2['default'].resolve([effect.action]);
    case effectTypes.NONE:
      return _promise2['default'].resolve([]);
    case effectTypes.LIFT:
      return effectToPromise(effect.effect).then(function (actions) {
        return actions.map(function (action) {
          return effect.factory.apply(effect, (0, _toConsumableArray3['default'])(effect.args).concat([action]));
        });
      });
  }
}

/**
 * Determines if the object was created with an effect creator.
 * @param {Object} object The object to inspect.
 * @returns {Boolean} Whether the object is an effect.
 */
function isEffect(object) {
  return object ? object[isEffectSymbol] : false;
}

/**
 * Determines id the effect object is of type none
 * @param {Object} The object to inspect.
 * @returns {Boolean} Whether the object is a none effect.
 */
function isNone(object) {
  return object ? object.type === effectTypes.NONE : false;
}

/**
 * Creates a noop effect.
 * @returns {Object} An effect of type NONE, essentially a no-op.
 */
function none() {
  return (0, _defineProperty3['default'])({
    type: effectTypes.NONE
  }, isEffectSymbol, true);
}

/**
 * Creates an effect for a function that returns a Promise.
 * @param {Function} factory The function to invoke with the given args that returns a Promise for an action.
 * @returns {Object} The wrapped effect of type PROMISE.
 */
function promise(factory) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return (0, _defineProperty3['default'])({
    factory: factory,
    args: args,
    type: effectTypes.PROMISE
  }, isEffectSymbol, true);
}

/**
 * Creates an effect for a function that returns an action.
 * @param {Function} factory The function to invoke with the given args that returns an action.
 * @returns {Object} The wrapped effect of type CALL.
 */
function call(factory) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return (0, _defineProperty3['default'])({
    factory: factory,
    args: args,
    type: effectTypes.CALL
  }, isEffectSymbol, true);
}

/**
 * Composes an array of effects together.
 */
function batch(effects) {
  return (0, _defineProperty3['default'])({
    effects: effects,
    type: effectTypes.BATCH
  }, isEffectSymbol, true);
}

/**
 * Creates an effect for an already-available action.
 */
function constant(action) {
  return (0, _defineProperty3['default'])({
    action: action,
    type: effectTypes.CONSTANT
  }, isEffectSymbol, true);
}

/**
 * Transform the return type of a bunch of `Effects`. This is primarily useful for adding tags to route `Actions` to the right place
 */
function lift(effect, factory) {
  for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    args[_key3 - 2] = arguments[_key3];
  }

  return (0, _defineProperty3['default'])({
    effect: effect,
    factory: factory,
    args: args,
    type: effectTypes.LIFT
  }, isEffectSymbol, true);
}