'use strict';

System.register(['lodash', './dfunc', 'app/plugins/sdk', './func_editor', './add_datadog_func', './query_builder'], function (_export, _context) {
  "use strict";

  var _, dfunc, QueryCtrl, queryBuilder, _createClass, DataDogQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_dfunc) {
      dfunc = _dfunc.default;
    }, function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_func_editor) {}, function (_add_datadog_func) {}, function (_query_builder) {
      queryBuilder = _query_builder;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('DataDogQueryCtrl', DataDogQueryCtrl = function (_QueryCtrl) {
        _inherits(DataDogQueryCtrl, _QueryCtrl);

        function DataDogQueryCtrl($scope, $injector, uiSegmentSrv, templateSrv) {
          _classCallCheck(this, DataDogQueryCtrl);

          var _this = _possibleConstructorReturn(this, (DataDogQueryCtrl.__proto__ || Object.getPrototypeOf(DataDogQueryCtrl)).call(this, $scope, $injector));

          _this.removeText = '-- remove tag --';
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
            _this.metricSegment = new uiSegmentSrv.newSelectMetric();
          }

          _this.target.tags = _this.target.tags || [];
          _this.tagSegments = _this.target.tags.map(uiSegmentSrv.newSegment);
          _this.fixTagSegments();

          _this.functions = [];
          _this.target.functions = _this.target.functions || [];
          _this.functions = _.map(_this.target.functions, function (func) {
            var f = dfunc.createFuncInstance(func.funcDef, { withDefaultParams: false });
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
            if (this.target.rawQuery) {
              console.log('Printing target in toggleEditorMode: \n')
              console.log(this.target);
              this.target.query = queryBuilder.buildQuery(this.target);
            } else {
              this.parseQuery();
            }
              
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
        }, {
          key: 'checkQuery',
          value: function checkQuery() {
            if (!(this.target.query || this.target.query.length != 0)) 
            // to avoid 400 Bad Request, this is the default query
              this.target.query = 'undefined:undefined{*}';
            this.panelCtrl.refresh();
          }
        }, {
          key: 'parseQuery',
          value: function parseQuery() {
            
            // sample query
            // derivative(count_not_null(avg:aws.autoscaling.group_in_service_instances{*} by {name,team}.as_count()))
            // derivative(abs(undefined:undefined{*}))
            console.log("Inside parseQuery: " + this.target.query + "\n");
            console.log('Printing target: \n');
            console.log(this.target);
            var stack = [];
            var query = this.target.query;
            var tmpString = [];

            if (query.indexOf('(') === -1) {
              stack.push(query);
            }

            for (var i = 0; i < query.length; ++i) {
              if (query[i] !== '(' && query[i] !== ')') {
                tmpString.push(query[i]);
              } else {
                stack.push(tmpString.join(''));
                tmpString = [];
              }
            } 

            console.log(stack)

            var functions = [];
            var scopes = [];
            var metricCollected = false;
            var aggregation, metric, as, groups = null;

            for (var component of stack) {
              // check if it is a function
              if (!component.includes(':') && !metricCollected) {
                functions.push(component);
              } else {
                // here its could have a metric, a scope
                // example: avg:aws.autoscaling.group_in_service_instances{*} by {name,team}.as_count
                // and it should be the last component
                var aggrIndex = component.indexOf(':');
                aggregation = component.slice(0, aggrIndex);
                console.log('Aggregation: ' + aggregation + '\n');

                // process metric
                var withNoAggr = component.slice(aggrIndex + 1);
                var metricEnd = withNoAggr.indexOf('{');
                metric = withNoAggr.slice(0, metricEnd);
                console.log('Metric: ' + metric + '\n');
                metricCollected = true;

                // process scopes
                var withNoMetric = withNoAggr.slice(metricEnd + 1);
                var scopeEnd = withNoMetric.indexOf('}');
                scopes = withNoMetric.slice(0, scopeEnd).trim().split(',');
                console.log('Scopes: ' + scopes + '\n');

                // process groups
                // example: by {name,team}.as_count
                var withNoScopes = withNoMetric.slice(scopeEnd + 1);
                var groupStart = withNoScopes.indexOf('{');
                if (groupStart !== -1) {
                  // there are groups
                  var groupEnd = withNoScopes.indexOf('}');
                  groups = withNoScopes.slice(groupStart + 1, groupEnd);
                  console.log('Groups: ' + groups + '\n');
                } 

                // process as
                var asStart = withNoScopes.indexOf('.');
                if (asStart !== -1) {
                  as = withNoScopes.slice(asStart + 1);
                  console.log('As: ' + as + '\n');
                }
                
                if (aggregation) {
                  this.target.aggregation = aggregation;
                  console.log('Aggr seg: ' + this.aggregationSegment.value + '\n');
                  this.aggregationSegment = this.uiSegmentSrv.newSegment(aggregation);
                  //this.panelCtrl.refresh();
                }

                if (metric) {
                  this.target.metric = metric;
                  //this.panelCtrl.refresh();
                  console.log('Metric seg: ' + this.metricSegment.value + '\n');
                  this.metricSegment = this.uiSegmentSrv.newSegment({
                    value: metric,
                    fake: true
                  });
                }
                
                if (as) {
                  this.target.as = as;
                  //this.panelCtrl.refresh();
                  console.log('AS seg: ' + this.asSegment.value + '\n');
                  this.asSegment = this.uiSegmentSrv.newSegment(as);
                }
                this.targetChanged();
                
                
                
              }
            }
            
            // console.log(stack);

          }
        }, {
          key: 'getMetrics',
          value: function getMetrics() {
            return this.datasource.metricFindQuery().then(this.uiSegmentSrv.transformToSegments(true));
          }
        }, {
          key: 'getAggregations',
          value: function getAggregations() {
            return Promise.resolve([{ text: 'avg by', value: 'avg' }, { text: 'max by', value: 'max' }, { text: 'min by', value: 'min' }, { text: 'sub by', value: 'sum' }]);
          }
        }, {
          key: 'getAs',
          value: function getAs() {
            return Promise.resolve([{ text: 'None', value: 'None' }, { text: 'as_count', value: 'as_count' }, { text: 'as_rate', value: 'as_rate' }]);
          }
        }, {
          key: 'getTags',
          value: function getTags(segment) {
            var _this2 = this;

            return this.datasource.tagFindQuery().then(this.uiSegmentSrv.transformToSegments(true)).then(function (results) {
              if (segment.type !== 'plus-button') {
                var removeSegment = _this2.uiSegmentSrv.newFake(_this2.removeText);
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
            this.target.as = this.asSegment.value;
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
            this.target.functions = _.map(this.functions, function (func) {
              return {
                funcDef: func.def.name,
                params: func.params.slice()
              };
            });
          }
        }, {
          key: 'removeFunction',
          value: function removeFunction(func) {
            this.functions = _.without(this.functions, func);
            this.persistFunctions();
            this.targetChanged();
          }
        }, {
          key: 'addFunction',
          value: function addFunction(funcDef) {
            var func = dfunc.createFuncInstance(funcDef, { withDefaultParams: true });
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

            var realSegments = _.filter(this.tagSegments, function (segment) {
              return segment.value;
            });
            this.target.tags = realSegments.map(function (segment) {
              return segment.value;
            });

            this.tagSegments = _.map(this.target.tags, this.uiSegmentSrv.newSegment);
            this.fixTagSegments();

            this.panelCtrl.refresh();
          }
        }]);

        return DataDogQueryCtrl;
      }(QueryCtrl));

      _export('DataDogQueryCtrl', DataDogQueryCtrl);

      DataDogQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map