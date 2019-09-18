"use strict";

var _prunk = _interopRequireDefault(require("prunk"));

var _jsdom = require("jsdom");

var _chai = _interopRequireDefault(require("chai"));

var _sinonChai = _interopRequireDefault(require("sinon-chai"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// JSHint options

/* globals global: false */
// Mock angular module
var angularMocks = {
  module: function module() {
    return {
      directive: function directive() {}
    };
  }
};
var datemathMock = {
  parse: function parse() {}
};
var momentMock = {
  duration: function duration(num, str) {
    return 60;
  }
}; // Mock Grafana modules that are not available outside of the core project
// Required for loading module.js

_prunk["default"].mock('./css/query-editor.css!', 'no css, dude.');

_prunk["default"].mock('app/plugins/sdk', {
  QueryCtrl: null
});

_prunk["default"].mock('app/core/utils/datemath', datemathMock);

_prunk["default"].mock('moment', momentMock);

_prunk["default"].mock('angular', angularMocks);

_prunk["default"].mock('jquery', 'module not found'); // Setup jsdom
// Required for loading angularjs


global.document = (0, _jsdom.jsdom)('<html><head><script></script></head><body></body></html>');
global.window = global.document.parentWindow;
global.navigator = window.navigator = {};
global.Node = window.Node; // Setup Chai

_chai["default"].should();

_chai["default"].use(_sinonChai["default"]);

global.assert = _chai["default"].assert;
global.expect = _chai["default"].expect;
//# sourceMappingURL=test-main.js.map
