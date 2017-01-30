'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataDogQueryCtrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _dfunc = require('./dfunc');

var _dfunc2 = _interopRequireDefault(_dfunc);

var _sdk = require('app/plugins/sdk');

require('./func_editor');

require('./add_datadog_func');

var _query_builder = require('./query_builder');

var queryBuilder = _interopRequireWildcard(_query_builder);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataDogQueryCtrl = exports.DataDogQueryCtrl = function (_QueryCtrl) {
  _inherits(DataDogQueryCtrl, _QueryCtrl);

  function DataDogQueryCtrl($scope, $injector, $q, uiSegmentSrv, templateSrv) {
    _classCallCheck(this, DataDogQueryCtrl);

    var _this = _possibleConstructorReturn(this, (DataDogQueryCtrl.__proto__ || Object.getPrototypeOf(DataDogQueryCtrl)).call(this, $scope, $injector));

    _this.removeText = '-- remove tag --';
    _this.$q = $q;
    _this.uiSegmentSrv = uiSegmentSrv;
    _this.templateSrv = templateSrv;

    if (_this.target.aggregation) {
      _this.aggregationSegment = new uiSegmentSrv.newSegment(_this.target.aggregation);
    } else {
      _this.aggregationSegment = new uiSegmentSrv.newSegment({
        value: 'Select Aggregation',
        fake: true,
        custom: false
      });
    }

    if (_this.target.metric) {
      _this.metricSegment = new uiSegmentSrv.newSegment(_this.target.metric);
    } else {
      _this.metricSegment = new uiSegmentSrv.newSegment({
        value: 'Select Metric',
        fake: true,
        custom: false
      });
    }

    _this.target.tags = _this.target.tags || [];
    _this.tagSegments = _this.target.tags.map(uiSegmentSrv.newSegment);
    _this.fixTagSegments();

    _this.functions = [];
    _this.target.functions = _this.target.functions || [];
    _this.functions = _lodash2.default.map(_this.target.functions, function (func) {
      var f = _dfunc2.default.createFuncInstance(func.funcDef, { withDefaultParams: false });
      f.params = func.params.slice();
      return f;
    });

    if (_this.target.as) {
      _this.asSegment = uiSegmentSrv.newSegment(_this.target.as);
    } else {
      _this.asSegment = uiSegmentSrv.newSegment({
        value: 'Select As',
        fake: true,
        custom: false
      });
    }

    return _this;
  }

  _createClass(DataDogQueryCtrl, [{
    key: 'toggleEditorMode',
    value: function toggleEditorMode() {
      this.target.rawQuery = !this.target.rawQuery;
    }
  }, {
    key: 'getMetrics',
    value: function getMetrics() {
      return this.datasource.metricFindQuery().then(this.transformToSegments(true));
    }
  }, {
    key: 'getAggregations',
    value: function getAggregations() {
      return this.$q.when([{ text: 'avg by', value: 'avg' }, { text: 'max by', value: 'max' }, { text: 'min by', value: 'min' }, { text: 'sub by', value: 'sum' }]);
    }
  }, {
    key: 'getAs',
    value: function getAs() {
      return this.$q.when([{ text: 'None', value: 'None' }, { text: 'as_count', value: 'as_count' }, { text: 'as_rate', value: 'as_rate' }]);
    }
  }, {
    key: 'getTags',
    value: function getTags(segment) {
      var _this2 = this;

      return this.datasource.metricFindTags().then(this.transformToSegments(false)).then(function (results) {
        if (segment.type !== 'plus-button') {
          var removeSegment = _this2.uiSegmentSrv.newSegment({ text: _this2.removeText, value: _this2.removeText });
          results.unshift(removeSegment);
        }

        return results;
      });
    }
  }, {
    key: 'aggregationChanged',
    value: function aggregationChanged() {
      this.target.aggregation = this.aggregationSegment.value;
      this.panelCtrl.refresh();
    }
  }, {
    key: 'metricChanged',
    value: function metricChanged() {
      this.target.metric = this.metricSegment.value;
      this.panelCtrl.refresh();
    }
  }, {
    key: 'asChanged',
    value: function asChanged() {
      if (this.asSegment.value === 'None') {
        this.target.as = null;
      } else {
        this.target.as = this.asSegment.value;
      }
      this.panelCtrl.refresh();
    }
  }, {
    key: 'fixTagSegments',
    value: function fixTagSegments() {
      var count = this.tagSegments.length;
      var lastSegment = this.tagSegments[Math.max(count - 1, 0)];

      if (!lastSegment || lastSegment.type !== 'plus-button') {
        this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
      }
    }
  }, {
    key: 'targetChanged',
    value: function targetChanged() {
      if (this.error) {
        return;
      }

      this.panelCtrl.refresh();
    }
  }, {
    key: 'persistFunctions',
    value: function persistFunctions() {
      this.target.functions = _lodash2.default.map(this.functions, function (func) {
        return {
          funcDef: func.def.name,
          params: func.params.slice()
        };
      });
    }
  }, {
    key: 'removeFunction',
    value: function removeFunction(func) {
      this.functions = _lodash2.default.without(this.functions, func);
      this.persistFunctions();
      this.targetChanged();
    }
  }, {
    key: 'addFunction',
    value: function addFunction(funcDef) {
      var func = _dfunc2.default.createFuncInstance(funcDef, { withDefaultParams: true });
      func.added = true;
      this.functions.push(func);
      this.persistFunctions();
      this.targetChanged();
    }
  }, {
    key: 'tagSegmentUpdated',
    value: function tagSegmentUpdated(segment, index) {
      if (segment.value === this.removeText) {
        this.tagSegments.splice(index, 1);
      }

      var realSegments = _lodash2.default.filter(this.tagSegments, function (segment) {
        return segment.value;
      });
      this.target.tags = realSegments.map(function (segment) {
        return segment.value;
      });

      this.tagSegments = _lodash2.default.map(this.target.tags, this.uiSegmentSrv.newSegment);
      this.fixTagSegments();

      this.panelCtrl.refresh();
    }
  }, {
    key: 'transformToSegments',
    value: function transformToSegments(addTemplateVars) {
      var _this3 = this;

      return function (results) {
        var segments = _lodash2.default.map(results, function (segment) {
          var newSegment = { value: segment.text, expandable: segment.expandable };
          return _this3.uiSegmentSrv.newSegment(newSegment);
        });

        if (addTemplateVars) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = _this3.templateSrv.variables[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var variable = _step.value;

              var newSegment = { type: 'template', value: '$' + variable.name, expandable: true };
              segments.unshift(_this3.uiSegmentSrv.newSegment(newSegment));
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
        }

        return segments;
      };
    }
  }, {
    key: 'getCollapsedText',
    value: function getCollapsedText() {
      if (this.target.rawQuery) {
        return this.target.query;
      } else {
        return queryBuilder.buildQuery(this.target);
      }
    }
  }]);

  return DataDogQueryCtrl;
}(_sdk.QueryCtrl);

DataDogQueryCtrl.templateUrl = 'partials/query.editor.html';
//# sourceMappingURL=query_ctrl.js.map
