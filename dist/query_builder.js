'use strict';

System.register(['lodash', './dfunc'], function (_export, _context) {
  "use strict";

  var _, dfunc;

  function buildQuery(target, adhocFilters) {
    var aggregation = target.aggregation,
        metric = target.metric,
        tags = target.tags,
        functions = target.functions;

    var query = aggregation + ':' + metric;

    var functionInstances = getFunctionInstances(functions);

    if (tags && tags.length || adhocFilters && adhocFilters.length) {
      query += '{';

      if (tags && tags.length) {
        query += tags.join(',');
      }

      if (adhocFilters && adhocFilters.length) {
        var adhocTags = buildAdHocFilterString(adhocFilters);
        if (tags && tags.length) {
          query += ',';
        }
        query += adhocTags;
      }

      query += '}';
    } else {
      query += '{*}';
    }

    if (target.as) {
      query += '.' + target.as + '()';
    }

    var groupedFuncs = _.groupBy(functionInstances, function (func) {
      if (func.def.append) {
        return 'appends';
      } else {
        return 'wraps';
      }
    });

    _.each(groupedFuncs.appends, function (func) {
      query += '.' + func.render();
    });

    _.each(groupedFuncs.wraps, function (func) {
      query = func.render(query);
    });

    return query;
  }

  _export('buildQuery', buildQuery);

  function getFunctionInstances(functions) {
    return _.map(functions, function (func) {
      var f = dfunc.createFuncInstance(func.funcDef, { withDefaultParams: false });
      f.params = func.params.slice();
      return f;
    });
  }

  function buildAdHocFilterString(adhocFilters) {
    return adhocFilters.map(function (filter) {
      return filter.key + ':' + filter.value;
    }).join(',');
  }
  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_dfunc) {
      dfunc = _dfunc.default;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=query_builder.js.map
