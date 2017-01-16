import _ from 'lodash';

export class DataDogDatasource {

  constructor (instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.api_key = instanceSettings.jsonData.api_key;
    this.application_key = instanceSettings.jsonData.app_key;
    this.supportMetrics = true;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this._cached_metrics = false;
  }

  // Function to check Datasource health
  testDatasource() {
    return this.backendSrv.datasourceRequest({
      url: this.url + '/downtime',
      method: 'GET',
      params: {
        api_key: this.api_key,
        application_key: this.application_key,
      }
    }).then(function(response) {
      if (response.status === 200) {
        return {
          status: "success",
          message: "Data source is working",
          title: "Success",
        };
      }
    });
  }

  metricFindTags() {
    if (this._cached_tags) {
      return this.q.when(this._cached_tags);
    }

    if (this.fetching_tags) {
      return this.fetching_tags;
    }
    var self = this;
    this.fetching_tags = this.backendSrv.datasourceRequest({
      url: self.url + '/tags/hosts',
      method: 'GET',
      params: {
        api_key: self.api_key,
        application_key: self.application_key,
      }
    }).then(function(response) {
      self._cached_tags = _.map(response.data.tags, function (hosts, tag) {
        return {
          text: tag,
          value: tag,
        };
      });

      return self._cached_tags;
    });

    return this.fetching_tags;
  }

  metricFindQuery() {
    if (this._cached_metrics) {
      return this.q.when(this._cached_metrics);
    }

    if (this.fetching) {
      return this.fetching;
    }

    var d = new Date();
    d.setDate(d.getDate() - 1);
    var from = Math.floor(d.getTime() / 1000);
    var self = this;

    this.fetching = this.backendSrv.datasourceRequest({
      url: self.url + '/metrics',
      method: 'GET',
      params: {
        api_key: self.api_key,
        application_key: self.application_key,
        from: from
      }
    }).then(function(response) {
      self._cached_metrics = _.map(response.data.metrics, function (metric) {
        return {
          text: metric,
          value: metric,
        };
      });

      return self._cached_metrics;
    });

    return this.fetching;
  }

  query(options) {
    var from = Math.floor(options.range.from.valueOf() / 1000);
    var to = Math.floor(options.range.to.valueOf() / 1000);

    var targets = options.targets.filter(function (t) { return !t.hide; });

    if (targets.length <= 0) {
      return this.q.when({data: []});
    }
    var queries = _.map(options.targets, function (val) {
      return val.query;
    });
    var queryString = queries.join(',');
    var query = {
      api_key: this.api_key,
      application_key: this.application_key,
      from: from,
      to: to,
      query: queryString,
    };

    return this.backendSrv.datasourceRequest({
      url: this.url + '/query',
      params: query,
      method: 'GET',
    }).then(function (response) {

      var dataResponse = _.map(response.data.series, function (series, i) {
        var target = targets[i];
        return {
          'target': target.alias || series.expression,
          'datapoints': _.map(series.pointlist, function (a) {
            return [a[1], a[0]];
          })
        };
      });

      return {data: dataResponse};
    });
  }
}
