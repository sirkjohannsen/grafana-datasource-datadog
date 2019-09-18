'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnnotationsQueryCtrl = exports.QueryOptionsCtrl = exports.ConfigCtrl = exports.QueryCtrl = exports.Datasource = undefined;

var _datasource = require('./datasource');

var _query_ctrl = require('./query_ctrl');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataDogConfigCtrl = function DataDogConfigCtrl() {
  _classCallCheck(this, DataDogConfigCtrl);
};

DataDogConfigCtrl.templateUrl = "partials/config.html";

var DataDogQueryOptionsCtrl = function DataDogQueryOptionsCtrl() {
  _classCallCheck(this, DataDogQueryOptionsCtrl);
};

DataDogQueryOptionsCtrl.templateUrl = "partials/query.options.html";

var DataDogAnnotationsQueryCtrl = function DataDogAnnotationsQueryCtrl() {
  _classCallCheck(this, DataDogAnnotationsQueryCtrl);
};

DataDogAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

exports.Datasource = _datasource.DataDogDatasource;
exports.QueryCtrl = _query_ctrl.DataDogQueryCtrl;
exports.ConfigCtrl = DataDogConfigCtrl;
exports.QueryOptionsCtrl = DataDogQueryOptionsCtrl;
exports.AnnotationsQueryCtrl = DataDogAnnotationsQueryCtrl;
//# sourceMappingURL=module.js.map
