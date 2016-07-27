'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.install = install;

var _utils = require('./utils');

var _errors = require('./errors');

var _loop = require('./loop');

var _effects = require('./effects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Installs a new dispatch function which will attempt to execute any effects
 * attached to the current model as established by the original dispatch.
 */
function install() {
  return function (next) {
    return function (reducer, initialState, enhancer) {
      var currentEffect = (0, _effects.none)();

      var _liftState = (0, _loop.liftState)(initialState);

      var _liftState2 = (0, _slicedToArray3['default'])(_liftState, 2);

      var initialModel = _liftState2[0];
      var initialEffect = _liftState2[1];


      var liftReducer = function liftReducer(reducer) {
        return function (state, action) {
          var result = reducer(state, action);

          var _liftState3 = (0, _loop.liftState)(result);

          var _liftState4 = (0, _slicedToArray3['default'])(_liftState3, 2);

          var model = _liftState4[0];
          var effect = _liftState4[1];

          if ((0, _effects.isNone)(currentEffect)) {
            currentEffect = effect;
          } else {
            currentEffect = (0, _effects.batch)([currentEffect, effect]);
          }
          return model;
        };
      };

      var store = next(liftReducer(reducer), initialModel, enhancer);

      var runEffect = function runEffect(originalAction, effect) {
        return (0, _effects.effectToPromise)(effect).then(function (actions) {
          return _promise2['default'].all(actions.map(dispatch));
        })['catch'](function (error) {
          console.error((0, _errors.loopPromiseCaughtError)(originalAction.type));
          throw error;
        });
      };

      var dispatch = function dispatch(action) {
        store.dispatch(action);
        var effectToRun = currentEffect;
        currentEffect = (0, _effects.none)();
        return runEffect(action, effectToRun);
      };

      var replaceReducer = function replaceReducer(reducer) {
        return store.replaceReducer(liftReducer(reducer));
      };

      runEffect({ type: '@@ReduxLoop/INIT' }, initialEffect);

      return (0, _extends3['default'])({}, store, {
        dispatch: dispatch,
        replaceReducer: replaceReducer
      });
    };
  };
}