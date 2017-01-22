import _ from 'lodash';

var index = [];
var categories = {
  Arithmatic: [],
  Interpolation: [],
  Timeshift: [],
  Rate: [],
  Smoothing: [],
  Rollup: [],
  Rank: [],
  Count: [],
  Regression: [],
  Algorithms: []
};

function addFuncDef(funcDef) {
  funcDef.params = funcDef.params || [];
  funcDef.defaultParams = funcDef.defaultParams || [];
  funcDef.append = funcDef.append || false;
  if (funcDef.category) {
    funcDef.category.push(funcDef);
  }
  index[funcDef.name] = funcDef;
  index[funcDef.name] = funcDef;
}

addFuncDef({
  name: 'abs',
  category: categories.Arithmatic,
});

addFuncDef({
  name: 'log2',
  category: categories.Arithmatic,
});

addFuncDef({
  name: 'cumsum',
  category: categories.Arithmatic,
});

addFuncDef({
  name: 'integral',
  category: categories.Arithmatic,
});

addFuncDef({
  name: 'fill',
  category: categories.Interpolation,
  params: [
    { name: "fill", type: 'string', options: ['null', 'zero', 'linear', 'last'] },
    { name: "limit", type: 'int', optional: true},
  ],
  defaultParams: ['zero'],
  append: true,
});

addFuncDef({
  name: 'hour_before',
  category: categories.Timeshift,
});

addFuncDef({
  name: 'day_before',
  category: categories.Timeshift,
});

addFuncDef({
  name: 'week_before',
  category: categories.Timeshift,
});

addFuncDef({
  name: 'month_before',
  category: categories.Timeshift,
});

addFuncDef({
  name: 'per_second',
  category: categories.Rate,
});

addFuncDef({
  name: 'per_minute',
  category: categories.Rate,
});

addFuncDef({
  name: 'per_hour',
  category: categories.Rate,
});

addFuncDef({
  name: 'dt',
  category: categories.Rate,
});

addFuncDef({
  name: 'diff',
  category: categories.Rate,
});

addFuncDef({
  name: 'derivative',
  category: categories.Rate,
});

addFuncDef({
  name: 'ewma_3',
  category: categories.Smoothing,
});

addFuncDef({
  name: 'ewma_5',
  category: categories.Smoothing,
});

addFuncDef({
  name: 'ewma_10',
  category: categories.Smoothing,
});

addFuncDef({
  name: 'ewma_20',
  category: categories.Smoothing,
});

addFuncDef({
  name: 'median_3',
  category: categories.Smoothing,
});

addFuncDef({
  name: 'median_5',
  category: categories.Smoothing,
});

addFuncDef({
  name: 'median_7',
  category: categories.Smoothing,
});

addFuncDef({
  name: 'median_9',
  category: categories.Smoothing,
});

addFuncDef({
  name: 'rollup',
  category: categories.Rollup,
  params: [
    { name: "rollup", type: 'string', options: ['sum', 'avg', 'min', 'max'] },
    { name: "period", type: 'int'},
  ],
  defaultParams: ['sum', 600],
  append: true
});

addFuncDef({
  name: 'count_nonzero',
  category: categories.Count,
});

addFuncDef({
  name: 'count_not_null',
  category: categories.Count,
});

addFuncDef({
  name: 'top',
  category: categories.Rank,
  params: [
    { name: "top", type: 'int', options: [5, 10, 15]},
    { name: "aggr", type: 'string', options: ['mean', 'min', 'max', 'area', 'l2norm', 'last']},
    { name: "dir", type: 'string', options: ['asc', 'desc']},
  ],
  defaultParams: [5, 'mean', 'dir'],
});

addFuncDef({
  name: 'robust_trend',
  category: categories.Regression,
});

addFuncDef({
  name: 'piecewise_constant',
  category: categories.Regression,
});

addFuncDef({
  name: 'anomalies',
  category: categories.Algorithms,
  params: [
    { name: "anomalies", type: 'string', options: ['basic', 'agile', 'robust', 'adaptive']},
    { name: "bonds", type: 'int', options: [1, 2, 3, 4, 5, 6]},
  ],
  defaultParams: ['basic', 2],
});

addFuncDef({
  name: 'anomalies',
  category: categories.Algorithms,
  params: [
    { name: "anomalies", type: 'string', options: ['basic', 'agile', 'robust', 'adaptive']},
    { name: "bonds", type: 'int', options: [1, 2, 3, 4, 5, 6]},
  ],
  defaultParams: ['basic', 2],
});

addFuncDef({
  name: 'outliers',
  category: categories.Algorithms,
  params: [
    { name: "outliers", type: 'string', options: ['DBSCAN', 'MAD', 'scaledDBSCAN', 'scaledMAD']},
    { name: "tolerance", type: 'int', options: [
      0.33,
      0.5,
      1,
      1.5,
      2.0,
      2.5,
      3.0,
      3.5,
      4.0,
      4.5,
      5.0]},
  ],
  defaultParams: ['basic', 2],
});

_.each(categories, function(funcList, catName) {
  categories[catName] = _.sortBy(funcList, 'name');
});

function FuncInstance(funcDef, options) {
  this.def = funcDef;
  this.params = [];

  if (options && options.withDefaultParams) {
    this.params = funcDef.defaultParams.slice(0);
  }

  this.updateText();
}

FuncInstance.prototype.render = function(metricExp) {
  var str = this.def.name + '(';
  var parameters = _.map(this.params, function(value) {
    return value;
  });
  if (metricExp && !this.def.append) {
    parameters.unshift(metricExp);
  }

  var funcRender = str + parameters.join(', ') + ')';
  console.log(funcRender, this.def.append);
  if (this.def.append) {
    return metricExp + '.' + funcRender;
  } else {
    return funcRender;
  }
};

FuncInstance.prototype.updateParam = function(strValue, index) {
  // handle optional parameters
  // if string contains ',' and next param is optional, split and update both

  if (strValue === '' && this.def.params[index].optional) {
    this.params.splice(index, 1);
  }
  else {
    this.params[index] = strValue;
  }

  this.updateText();
};

FuncInstance.prototype.updateText = function () {
  if (this.params.length === 0) {
    this.text = this.def.name + '()';
    return;
  }

  var text = this.def.name + '(';
  text += this.params.join(', ');
  text += ')';
  this.text = text;
};

var createFuncInstance = function(funcDef, options) {
  if (_.isString(funcDef)) {
    if (!index[funcDef]) {
      throw { message: 'Method not found ' + name };
    }
    funcDef = index[funcDef];
  }
  return new FuncInstance(funcDef, options);
};

var getFuncDef = function(name) {
  return index[name];
};

var getCategories = function() {
  return categories;
};

var foo;

export default foo = {
  createFuncInstance: createFuncInstance,
  getFuncDef: getFuncDef,
  getCategories: getCategories,
};

