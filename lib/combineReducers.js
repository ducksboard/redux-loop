'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

exports.combineReducers = combineReducers;

var _loop = require('./loop');

var _effects = require('./effects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function optimizeBatch(effects) {
  switch (effects.length) {
    case 0:
      return (0, _effects.none)();
    case 1:
      return effects[0];
    default:
      return (0, _effects.batch)(effects);
  }
}

var defaultAccessor = function defaultAccessor(state, key) {
  return state[key];
};

var defaultMutator = function defaultMutator(state, key, value) {
  return (0, _extends4['default'])({}, state, (0, _defineProperty3['default'])({}, key, value));
};

function combineReducers(reducerMap) {
  var rootState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var accessor = arguments.length <= 2 || arguments[2] === undefined ? defaultAccessor : arguments[2];
  var mutator = arguments.length <= 3 || arguments[3] === undefined ? defaultMutator : arguments[3];

  return function finalReducer() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? rootState : arguments[0];
    var action = arguments[1];

    var hasChanged = false;
    var effects = [];

    var model = (0, _keys2['default'])(reducerMap).reduce(function (model, key) {
      var reducer = reducerMap[key];
      var previousStateForKey = accessor(state, key);
      var nextStateForKey = reducer(previousStateForKey, action);

      if ((0, _loop.isLoop)(nextStateForKey)) {
        effects.push((0, _loop.getEffect)(nextStateForKey));
        nextStateForKey = (0, _loop.getModel)(nextStateForKey);
      }

      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      return mutator(model, key, nextStateForKey);
    }, rootState);

    return (0, _loop.loop)(hasChanged ? model : state, optimizeBatch(effects));
  };
}