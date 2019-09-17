"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Datasource", {
  enumerable: true,
  get: function get() {
    return _datasource.DataDogDatasource;
  }
});
Object.defineProperty(exports, "QueryCtrl", {
  enumerable: true,
  get: function get() {
    return _query_ctrl.DataDogQueryCtrl;
  }
});
exports.AnnotationsQueryCtrl = exports.QueryOptionsCtrl = exports.ConfigCtrl = void 0;

var _datasource = require("./datasource");

var _query_ctrl = require("./query_ctrl");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataDogConfigCtrl = function DataDogConfigCtrl() {
  _classCallCheck(this, DataDogConfigCtrl);
};

exports.ConfigCtrl = DataDogConfigCtrl;
DataDogConfigCtrl.templateUrl = "partials/config.html";

var DataDogQueryOptionsCtrl = function DataDogQueryOptionsCtrl() {
  _classCallCheck(this, DataDogQueryOptionsCtrl);
};

exports.QueryOptionsCtrl = DataDogQueryOptionsCtrl;
DataDogQueryOptionsCtrl.templateUrl = "partials/query.options.html";

var DataDogAnnotationsQueryCtrl = function DataDogAnnotationsQueryCtrl() {
  _classCallCheck(this, DataDogAnnotationsQueryCtrl);
};

exports.AnnotationsQueryCtrl = DataDogAnnotationsQueryCtrl;
DataDogAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';
//# sourceMappingURL=module.js.map
