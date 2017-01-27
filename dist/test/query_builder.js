'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.buildQuery = buildQuery;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _dfunc = require('./dfunc');

var _dfunc2 = _interopRequireDefault(_dfunc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

	var groupedFuncs = _lodash2.default.groupBy(functionInstances, function (func) {
		if (func.def.append) {
			return 'appends';
		} else {
			return 'wraps';
		}
	});

	_lodash2.default.each(groupedFuncs.appends, function (func) {
		query += '.' + func.render();
	});

	_lodash2.default.each(groupedFuncs.wraps, function (func) {
		query = func.render(query);
	});

	return query;
}

function getFunctionInstances(functions) {
	return _lodash2.default.map(functions, function (func) {
		var f = _dfunc2.default.createFuncInstance(func.funcDef, { withDefaultParams: false });
		f.params = func.params.slice();
		return f;
	});
}

function buildAdHocFilterString(adhocFilters) {
	return adhocFilters.map(function (filter) {
		return filter.key + ':' + filter.value;
	}).join(',');
}
//# sourceMappingURL=query_builder.js.map
