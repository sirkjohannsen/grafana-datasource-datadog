'use strict';

var _prunk = require('prunk');

var _prunk2 = _interopRequireDefault(_prunk);

var _jsdom = require('jsdom');

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireDefault(_sinonChai);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mock angular module
// JSHint options
/* globals global: false */

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
};

// Mock Grafana modules that are not available outside of the core project
// Required for loading module.js
_prunk2.default.mock('./css/query-editor.css!', 'no css, dude.');
_prunk2.default.mock('app/plugins/sdk', {
  QueryCtrl: null
});
_prunk2.default.mock('app/core/utils/datemath', datemathMock);
_prunk2.default.mock('moment', momentMock);
_prunk2.default.mock('angular', angularMocks);
_prunk2.default.mock('jquery', 'module not found');

// Setup jsdom
// Required for loading angularjs
global.document = (0, _jsdom.jsdom)('<html><head><script></script></head><body></body></html>');
global.window = global.document.parentWindow;
global.navigator = window.navigator = {};
global.Node = window.Node;

// Setup Chai
_chai2.default.should();
_chai2.default.use(_sinonChai2.default);
global.assert = _chai2.default.assert;
global.expect = _chai2.default.expect;
//# sourceMappingURL=test-main.js.map
