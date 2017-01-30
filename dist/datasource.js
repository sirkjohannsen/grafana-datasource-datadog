'use strict';

System.register(['lodash', './showdown.min.js', './query_builder'], function (_export, _context) {
  "use strict";

  var _, showdown, queryBuilder, _createClass, DataDogDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  /*
   * Convert tags to key-value pairs
   * [region:east, region:nw] => {region: [east, nw]}
   */
  function mapTagsToKVPairs(tags) {
    var kv_tags = _.filter(tags, function (tag) {
      return tag.indexOf(':') !== -1;
    });

    var kv_pairs = kv_tags.map(function (tag) {
      return tag.split(':', 2); // Limit to 2
    });

    var kv_object = {};
    kv_pairs.forEach(function (pair) {
      var key = pair[0];
      var val = pair[1];

      if (kv_object[key]) {
        kv_object[key].push(val);
      } else {
        kv_object[key] = [val];
      }
    });

    return kv_object;
  }

  /*
   * Convert DataDog event text from markdown to pure HTML
   * http://docs.datadoghq.com/guides/markdown/
   */
  function convertDataDogMdToHtml(str) {
    var MD_START = '%%%\n';
    var MD_END = '\n%%%';

    console.log(str);
    var md_start_index = str.indexOf(MD_START) + MD_START.length;
    var md_end_index = str.indexOf(MD_END);
    var md = str.substring(md_start_index, md_end_index);
    md = removeImagesFromDataDogMarkdown(md);

    var converter = new showdown.Converter();
    return converter.makeHtml(md);
  }

  function isDataDogMarkdown(str) {
    var MD_START = '%%%\n';
    return str.indexOf(MD_START) >= 0;
  }

  function removeImagesFromDataDogMarkdown(str) {
    var dataDogImagePattern = /\[{0,1}\!\[.*\]\(https{0,1}\:\/\/p\.datadoghq\.com\/snapshot.+\)/g;
    return str.replace(dataDogImagePattern, '');
  }
  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_showdownMinJs) {
      showdown = _showdownMinJs.default;
    }, function (_query_builder) {
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

      _export('DataDogDatasource', DataDogDatasource = function () {
        function DataDogDatasource(instanceSettings, backendSrv, templateSrv) {
          _classCallCheck(this, DataDogDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.api_key = instanceSettings.jsonData.api_key;
          this.application_key = instanceSettings.jsonData.app_key;
          this.supportMetrics = true;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
          this._cached_metrics = false;
        }

        // Function to check Datasource health


        _createClass(DataDogDatasource, [{
          key: 'testDatasource',
          value: function testDatasource() {
            return this.invokeDataDogApiRequest('/downtime').then(function () {
              return {
                status: "success",
                title: "Success",
                message: "Data source is working"
              };
            }).catch(function (error) {
              var message = "Connection error";
              if (error && error.message) {
                message = error.message;
              }

              return {
                status: "error",
                title: "Error",
                message: message
              };
            });
          }
        }, {
          key: 'metricFindTags',
          value: function metricFindTags() {
            return this.getTagsFromCache().then(function (tags) {
              return _.map(tags, function (hosts, tag) {
                return {
                  text: tag,
                  value: tag
                };
              });
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery() {
            var _this = this;

            if (this._cached_metrics) {
              return Promise.resolve(this._cached_metrics);
            }

            if (this.fetching) {
              return this.fetching;
            }

            var d = new Date();
            d.setDate(d.getDate() - 1);
            var from = Math.floor(d.getTime() / 1000);
            var params = { from: from };

            this.fetching = this.invokeDataDogApiRequest('/metrics', params).then(function (result) {
              _this._cached_metrics = _.map(result.metrics, function (metric) {
                return {
                  text: metric,
                  value: metric
                };
              });

              return _this._cached_metrics;
            });

            return this.fetching;
          }
        }, {
          key: 'getTagKeys',
          value: function getTagKeys() {
            return this.getTagsFromCache().then(function (tagsHosts) {
              var tags = Object.keys(tagsHosts);
              var kv = mapTagsToKVPairs(tags);
              var grafanaTags = Object.keys(kv);

              return grafanaTags.map(function (tag) {
                return {
                  text: tag,
                  value: tag
                };
              });
            });
          }
        }, {
          key: 'getTagValues',
          value: function getTagValues(options) {
            return this.getTagsFromCache().then(function (tagsHosts) {
              var tags = Object.keys(tagsHosts);
              var kv = mapTagsToKVPairs(tags);
              var grafanaValues = kv[options.key];
              return grafanaValues.map(function (val) {
                return {
                  text: val,
                  value: val
                };
              });
            });
          }
        }, {
          key: 'query',
          value: function query(options) {
            var from = Math.floor(options.range.from.valueOf() / 1000);
            var to = Math.floor(options.range.to.valueOf() / 1000);

            var targets = options.targets.filter(function (t) {
              return !t.hide;
            });

            if (targets.length <= 0) {
              return Promise.resolve({ data: [] });
            }

            // add global adhoc filters
            var adhocFilters = this.templateSrv.getAdhocFilters(this.name);

            var queries = _.map(targets, function (target) {
              var query = void 0;
              if (target.rawQuery) {
                query = target.query;
              } else {
                query = queryBuilder.buildQuery(target, adhocFilters);
              }
              return query;
            });

            var queryString = queries.join(',');
            queryString = this.templateSrv.replace(queryString, options.scopedVars);

            var params = {
              from: from,
              to: to,
              query: queryString
            };

            return this.invokeDataDogApiRequest('/query', params).then(function (result) {
              var dataResponse = _.map(result.series, function (series, i) {
                var target = targets[i];
                return {
                  'target': target.alias || series.expression,
                  'datapoints': _.map(series.pointlist, function (point) {
                    return [point[1], point[0]];
                  })
                };
              });

              return { data: dataResponse };
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
            var timeFrom = Math.floor(options.range.from.valueOf() / 1000);
            var timeTo = Math.floor(options.range.to.valueOf() / 1000);
            var _options$annotation = options.annotation,
                priority = _options$annotation.priority,
                sources = _options$annotation.sources,
                tags = _options$annotation.tags;


            return this.getEventStream(timeFrom, timeTo, priority, sources, tags).then(function (eventStreams) {
              var eventAnnotations = eventStreams.map(function (eventStream) {
                var allEvents = eventStream.children;
                var filteredEvents = _.filter(allEvents, function (event) {
                  return event.alert_type !== 'success';
                });

                return _.map(filteredEvents, function (event) {
                  var renderedText = eventStream.text;
                  if (isDataDogMarkdown(eventStream.text)) {
                    renderedText = convertDataDogMdToHtml(eventStream.text);
                  }
                  console.log(renderedText);

                  return {
                    annotation: options.annotation,
                    time: event.date_happened * 1000,
                    title: eventStream.title,
                    text: renderedText,
                    tags: eventStream.tags
                  };
                });
              });

              return _.flatten(eventAnnotations);
            });
          }
        }, {
          key: 'getHosts',
          value: function getHosts() {
            return this.searchEntities('hosts');
          }
        }, {
          key: 'searchEntities',
          value: function searchEntities(entity) {
            var params = { q: '' };
            if (entity) {
              params.q = entity + ':';
            }

            return this.invokeDataDogApiRequest('/search', params).then(function (result) {
              if (result && result.results) {
                return result.results[entity];
              }
            });
          }
        }, {
          key: 'getTagsHosts',
          value: function getTagsHosts() {
            return this.invokeDataDogApiRequest('/tags/hosts').then(function (result) {
              if (result && result.tags) {
                return result.tags;
              }
            });
          }
        }, {
          key: 'getTagsFromCache',
          value: function getTagsFromCache() {
            var _this2 = this;

            var getTags = void 0;
            if (this._cached_tags && this._cached_tags.length) {
              getTags = Promise.resolve(this._cached_tags);
            } else {
              getTags = this.getTagsHosts().then(function (tags) {
                _this2._cached_tags = tags;
                return tags;
              });
            }

            return getTags;
          }
        }, {
          key: 'getEventStream',
          value: function getEventStream(timeFrom, timeTo, priority, sources, tags) {
            var params = {
              start: timeFrom,
              end: timeTo
            };
            if (priority) {
              params.priority = priority;
            }
            if (sources) {
              params.sources = sources;
            }
            if (tags) {
              params.tags = tags;
            }

            return this.invokeDataDogApiRequest('/events', params).then(function (result) {
              if (result.events) {
                return result.events;
              } else {
                return [];
              }
            });
          }
        }, {
          key: 'invokeDataDogApiRequest',
          value: function invokeDataDogApiRequest(url) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            // Set auth params
            params.api_key = this.api_key;
            params.application_key = this.application_key;

            return this.backendSrv.datasourceRequest({
              method: 'GET',
              url: this.url + url,
              params: params
            }).then(function (response) {
              if (response.data) {
                return response.data;
              } else {
                throw { message: 'DataDog API request error' };
              }
            }).catch(function (error) {
              var message = 'DataDog API request error';
              if (error.statusText) {
                message = error.status + ' ' + error.statusText;
                throw { message: message };
              } else if (error.err.statusText) {
                throw { message: error.err.statusText };
              } else {
                throw { message: message };
              }
            });
          }
        }]);

        return DataDogDatasource;
      }());

      _export('DataDogDatasource', DataDogDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
