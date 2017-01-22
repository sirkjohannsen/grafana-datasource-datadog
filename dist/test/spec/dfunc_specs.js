'use strict';

var _common = require('test/lib/common');

var _dfunc = require('../dfunc');

var _dfunc2 = _interopRequireDefault(_dfunc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _common.describe)('when creating func instance from func names', function () {
  (0, _common.it)('should return func instance', function () {
    var func = _dfunc2.default.createFuncInstance('sumSeries');
    (0, _common.expect)(func).to.be.ok();
    (0, _common.expect)(func.def.name).to.equal('sumSeries');
    (0, _common.expect)(func.def.params.length).to.equal(5);
    (0, _common.expect)(func.def.defaultParams.length).to.equal(1);
  });

  (0, _common.it)('should return func instance with shortName', function () {
    var func = _dfunc2.default.createFuncInstance('sum');
    (0, _common.expect)(func).to.be.ok();
  });

  (0, _common.it)('should return func instance from funcDef', function () {
    var func = _dfunc2.default.createFuncInstance('sum');
    var func2 = _dfunc2.default.createFuncInstance(func.def);
    (0, _common.expect)(func2).to.be.ok();
  });

  (0, _common.it)('func instance should have text representation', function () {
    var func = _dfunc2.default.createFuncInstance('groupByNode');
    func.params[0] = 5;
    func.params[1] = 'avg';
    func.updateText();
    (0, _common.expect)(func.text).to.equal("groupByNode(5, avg)");
  });
});

(0, _common.describe)('when rendering func instance', function () {

  (0, _common.it)('should handle single metric param', function () {
    var func = _dfunc2.default.createFuncInstance('sumSeries');
    (0, _common.expect)(func.render('hello.metric')).to.equal("sumSeries(hello.metric)");
  });

  (0, _common.it)('should include default params if options enable it', function () {
    var func = _dfunc2.default.createFuncInstance('scaleToSeconds', { withDefaultParams: true });
    (0, _common.expect)(func.render('hello')).to.equal("scaleToSeconds(hello, 1)");
  });

  (0, _common.it)('should handle int or interval params with number', function () {
    var func = _dfunc2.default.createFuncInstance('movingMedian');
    func.params[0] = '5';
    (0, _common.expect)(func.render('hello')).to.equal("movingMedian(hello, 5)");
  });

  (0, _common.it)('should handle int or interval params with interval string', function () {
    var func = _dfunc2.default.createFuncInstance('movingMedian');
    func.params[0] = '5min';
    (0, _common.expect)(func.render('hello')).to.equal("movingMedian(hello, '5min')");
  });

  (0, _common.it)('should handle metric param and int param and string param', function () {
    var func = _dfunc2.default.createFuncInstance('groupByNode');
    func.params[0] = 5;
    func.params[1] = 'avg';
    (0, _common.expect)(func.render('hello.metric')).to.equal("groupByNode(hello.metric, 5, 'avg')");
  });

  (0, _common.it)('should handle function with no metric param', function () {
    var func = _dfunc2.default.createFuncInstance('randomWalk');
    func.params[0] = 'test';
    (0, _common.expect)(func.render(undefined)).to.equal("randomWalk('test')");
  });

  (0, _common.it)('should handle function multiple series params', function () {
    var func = _dfunc2.default.createFuncInstance('asPercent');
    func.params[0] = '#B';
    (0, _common.expect)(func.render('#A')).to.equal("asPercent(#A, #B)");
  });
});

(0, _common.describe)('when requesting function categories', function () {
  (0, _common.it)('should return function categories', function () {
    var catIndex = _dfunc2.default.getCategories();
    (0, _common.expect)(catIndex.Special.length).to.be.greaterThan(8);
  });
});

(0, _common.describe)('when updating func param', function () {
  (0, _common.it)('should update param value and update text representation', function () {
    var func = _dfunc2.default.createFuncInstance('summarize', { withDefaultParams: true });
    func.updateParam('1h', 0);
    (0, _common.expect)(func.params[0]).to.be('1h');
    (0, _common.expect)(func.text).to.be('summarize(1h, sum, false)');
  });

  (0, _common.it)('should parse numbers as float', function () {
    var func = _dfunc2.default.createFuncInstance('scale');
    func.updateParam('0.001', 0);
    (0, _common.expect)(func.params[0]).to.be('0.001');
  });
});

(0, _common.describe)('when updating func param with optional second parameter', function () {
  (0, _common.it)('should update value and text', function () {
    var func = _dfunc2.default.createFuncInstance('aliasByNode');
    func.updateParam('1', 0);
    (0, _common.expect)(func.params[0]).to.be('1');
  });

  (0, _common.it)('should slit text and put value in second param', function () {
    var func = _dfunc2.default.createFuncInstance('aliasByNode');
    func.updateParam('4,-5', 0);
    (0, _common.expect)(func.params[0]).to.be('4');
    (0, _common.expect)(func.params[1]).to.be('-5');
    (0, _common.expect)(func.text).to.be('aliasByNode(4, -5)');
  });

  (0, _common.it)('should remove second param when empty string is set', function () {
    var func = _dfunc2.default.createFuncInstance('aliasByNode');
    func.updateParam('4,-5', 0);
    func.updateParam('', 1);
    (0, _common.expect)(func.params[0]).to.be('4');
    (0, _common.expect)(func.params[1]).to.be(undefined);
    (0, _common.expect)(func.text).to.be('aliasByNode(4)');
  });
});
//# sourceMappingURL=dfunc_specs.js.map
