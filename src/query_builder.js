import _ from 'lodash';
import dfunc from './dfunc';

export function buildQuery(target, adhocFilters) {
  let {aggregation, metric, tags, functions} = target;
  let query = `${aggregation}:${metric}`;

  let functionInstances  = getFunctionInstances(functions);

  if ((tags && tags.length) || (adhocFilters && adhocFilters.length)) {
    query += '{';

    if (tags && tags.length) {
      query += tags.join(',');
    }

    if (adhocFilters && adhocFilters.length) {
      let adhocTags = buildAdHocFilterString(adhocFilters);
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

  var groupedFuncs = _.groupBy(functionInstances, func => {
    if (func.def.append) {
      return 'appends';
    } else {
      return 'wraps';
    }
  });

  _.each(groupedFuncs.appends, func => {
    query += '.' + func.render();
  });

  _.each(groupedFuncs.wraps, func => {
    query = func.render(query);
  });

  return query;
}

function getFunctionInstances(functions) {
  return _.map(functions, func => {
    var f = dfunc.createFuncInstance(func.funcDef, {withDefaultParams: false});
    f.params = func.params.slice();
    return f;
  });
}

function buildAdHocFilterString(adhocFilters) {
  return adhocFilters.map(filter => {
    return filter.key + ':' + filter.value;
  }).join(',');
}
