import _ from 'lodash';

export class DataDogDatasource {

  constructor (instanceSettings, backendSrv, templateSrv) {
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
  testDatasource() {
    return this.invokeDataDogApiRequest('/downtime')
    .then(() => {
      return {
        status: "success",
        title: "Success",
        message: "Data source is working"
      };
    })
    .catch(error => {
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

  metricFindTags() {
    if (this._cached_tags && this._cached_tags.length) {
      return Promise.resolve(this._cached_tags);
    }

    if (this.fetching_tags) {
      return this.fetching_tags;
    }

    this.searchEntities('hosts').then(entitis => {
      console.log(entitis);
    });

    this.fetching_tags = this.getTagsHosts()
    .then(tags => {
      this._cached_tags = _.map(tags, (hosts, tag) => {
        return {
          text: tag,
          value: tag,
        };
      });

      return this._cached_tags;
    });

    return this.fetching_tags;
  }

  metricFindQuery() {
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

    this.fetching = this.invokeDataDogApiRequest('/metrics', params)
    .then(result => {
      this._cached_metrics = _.map(result.metrics, metric => {
        return {
          text: metric,
          value: metric,
        };
      });

      return this._cached_metrics;
    });

    return this.fetching;
  }

  getTagKeys(options) {
    return this.getTagsHosts().then(tagsHosts => {
      let tags = Object.keys(tagsHosts);
      let kv = mapTagsToKVPairs(tags);
      let grafanaTags = Object.keys(kv);
      return grafanaTags.map(tag => {
        return {
          text: tag,
          value: tag,
        };
      });
    });
  }

  getTagValues(options) {
    return this.getTagsHosts().then(tagsHosts => {
      let tags = Object.keys(tagsHosts);
      let kv = mapTagsToKVPairs(tags);
      let grafanaValues = kv[options.key];
      return grafanaValues.map(val => {
        return {
          text: val,
          value: val,
        };
      });
    });
  }

  query(options) {
    var from = Math.floor(options.range.from.valueOf() / 1000);
    var to = Math.floor(options.range.to.valueOf() / 1000);

    var targets = options.targets.filter(function (t) { return !t.hide; });

    if (targets.length <= 0) {
      return Promise.resolve({data: []});
    }
    var queries = _.map(options.targets, function (val) {
      return val.query;
    });

    // add global adhoc filters
    let adhocFilters = this.templateSrv.getAdhocFilters(this.name);
    console.log(adhocFilters, this.buildAdHocFilterString());

    var queryString = queries.join(',');
    queryString = this.templateSrv.replace(queryString, options.scopedVars);

    var params = {
      from: from,
      to: to,
      query: queryString,
    };

    return this.invokeDataDogApiRequest('/query', params)
    .then(result => {
      var dataResponse = _.map(result.series, (series, i) => {
        var target = targets[i];
        return {
          'target': target.alias || series.expression,
          'datapoints': _.map(series.pointlist, point => {
            return [point[1], point[0]];
          })
        };
      });

      return {data: dataResponse};
    });
  }

  buildAdHocFilterString() {
    let adhocFilters = this.templateSrv.getAdhocFilters(this.name);
    return adhocFilters.map(filter => {
      return filter.key + ':' + filter.value;
    }).join(',');
  }

  annotationQuery(options) {
    let timeFrom = Math.floor(options.range.from.valueOf() / 1000);
    let timeTo = Math.floor(options.range.to.valueOf() / 1000);
    let {priority, sources, tags} = options.annotation;

    return this.getEventStream(timeFrom, timeTo, priority, sources, tags)
    .then(eventStreams => {
      let eventAnnotations = eventStreams.map(eventStream => {
        let allEvents = eventStream.children;
        let filteredEvents = _.filter(allEvents, event => {
          return event.alert_type !== 'success';
        });

        return _.map(filteredEvents, event => {
          return {
            annotation: options.annotation,
            time: event.date_happened * 1000,
            title: eventStream.title,
            text: eventStream.text,
            tags: eventStream.tags
          };
        });
      });

      return _.flatten(eventAnnotations);
    });
  }

  getHosts() {
    return this.searchEntities('hosts');
  }

  // entity should be 'hosts' or 'metrics'
  // http://docs.datadoghq.com/api/?lang=console#search
  searchEntities(entity) {
    let params = {q: ''};
    if (entity) {
      params.q = `${entity}:`;
    }

    return this.invokeDataDogApiRequest('/search', params)
    .then(result => {
      if (result && result.results) {
        return result.results[entity];
      }
    });
  }

  getTagsHosts() {
    return this.invokeDataDogApiRequest('/tags/hosts')
    .then(result => {
      if (result && result.tags) {
        return result.tags;
      }
    });
  }

  getEventStream(timeFrom, timeTo, priority, sources, tags) {
    let params = {
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

    return this.invokeDataDogApiRequest('/events', params)
    .then(result => {
      if (result.events) {
        return result.events;
      } else {
        return [];
      }
    });
  }

  invokeDataDogApiRequest(url, params = {}) {
    // Set auth params
    params.api_key = this.api_key;
    params.application_key = this.application_key;

    return this.backendSrv.datasourceRequest({
      method: 'GET',
      url: this.url + url,
      params: params
    })
    .then(response => {
      if (response.data) {
        return response.data;
      } else {
        throw {message: 'DataDog API request error'};
      }
    })
    .catch(error => {
      var message = 'DataDog API request error';
      if (error.statusText) {
        message = error.status + ' ' + error.statusText;
        throw {message: message};
      } else if (error.err.statusText) {
        throw {message: error.err.statusText};
      } else {
        throw {message: message};
      }
    });
  }
}

/*
 * Convert tags to key-value pairs
 * [region:east, region:nw] => {region: [east, nw]}
 */
function mapTagsToKVPairs(tags) {
  let kv_tags = _.filter(tags, tag => {
    return (tag.indexOf(':') !== -1);
  });

  let kv_pairs = kv_tags.map(tag => {
    return tag.split(':', 2); // Limit to 2
  });

  let kv_object = {};
  kv_pairs.forEach(pair => {
    let key = pair[0];
    let val = pair[1];

    if (kv_object[key]) {
      kv_object[key].push(val);
    } else {
      kv_object[key] = [val];
    }
  });

  return kv_object;
}
