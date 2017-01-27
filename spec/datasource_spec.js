import {Datasource} from "../module";
import Q from "q";
import sinon from 'sinon';

describe('DataDogDatasource', () => {
  let ctx = {};

  beforeEach(function() {
    ctx.$q = Q;
    ctx.backendSrv = {
      datasourceRequest: () => {
        return ctx.$q.when({
          status: 200
        });
      }
    };
    ctx.templateSrv = {
      replace: (str) => str,
      getAdhocFilters: () => []
    };

    let instanceSettings = {
      url: 'https://app.datadoghq.com/api/v1',
      jsonData: {
        api_key: '0000deadbeaf0000',
        app_key: '0000abcd0000abcd'
      }
    };
    ctx.ds = new Datasource(instanceSettings, ctx.backendSrv, ctx.templateSrv);
  });

  describe('When doing DataDog API request', () => {
    beforeEach(function() {
      let targets = [
        { query: 'avg:system.load.5{*}', rawQuery: true }
      ];

      ctx.options = {
        range: {
          from: 12340000,
          to: 12340000
        },
        targets: targets
      };
    });

    it('should send request with proper params', (done) => {
      let expected_params = {
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
      let datasourceRequest = sinon.spy(ctx.ds.backendSrv, 'datasourceRequest');

      ctx.ds.query(ctx.options);
      expect(datasourceRequest).to.have.been.calledWith(expected_params);
      done();
    });
  });
});
