"use strict";

var _module = require("../module");

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('DataDogDatasource', function () {
  var ctx = {};

  beforeEach(function () {
    ctx.$q = _q2.default;
    ctx.backendSrv = {
      datasourceRequest: function datasourceRequest() {
        return ctx.$q.when({
          status: 200
        });
      }
    };
    ctx.templateSrv = {
      replace: function replace(str) {
        return str;
      },
      getAdhocFilters: function getAdhocFilters() {
        return [];
      }
    };

    var instanceSettings = {
      url: 'https://app.datadoghq.com/api/v1',
      jsonData: {
        api_key: '0000deadbeaf0000',
        app_key: '0000abcd0000abcd'
      }
    };
    ctx.ds = new _module.Datasource(instanceSettings, ctx.backendSrv, ctx.templateSrv);
  });

  describe('When doing DataDog API request', function () {
    beforeEach(function () {
      var targets = [{ query: 'avg:system.load.5{*}', rawQuery: true }];

      ctx.options = {
        range: {
          from: 12340000,
          to: 12340000
        },
        targets: targets
      };
    });

    it('should send request with proper params', function (done) {
      var expected_params = {
        method: 'GET',
        url: 'https://app.datadoghq.com/api/v1/query',
        params: {
          api_key: '0000deadbeaf0000',
          application_key: '0000abcd0000abcd',
          from: 12340,
          to: 12340,
          query: 'avg:system.load.5{*}'
        }
      };
      var datasourceRequest = _sinon2.default.spy(ctx.ds.backendSrv, 'datasourceRequest');

      ctx.ds.query(ctx.options);
      expect(datasourceRequest).to.have.been.calledWith(expected_params);
      done();
    });
  });
});
//# sourceMappingURL=datasource_spec.js.map
