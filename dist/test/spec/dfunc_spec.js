"use strict";

var _dfunc = _interopRequireDefault(require("../dfunc"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('when creating func instance from func names', function () {
  it('should return func instance', function () {
    var func = _dfunc["default"].createFuncInstance('top');

    expect(func).to.be.ok;
    expect(func.def.name).to.equal('top');
    expect(func.def.params.length).to.equal(3);
    expect(func.def.defaultParams.length).to.equal(3);
  });
  it('should return func instance from funcDef', function () {
    var func = _dfunc["default"].createFuncInstance('top');

    var func2 = _dfunc["default"].createFuncInstance(func.def);

    expect(func2).to.be.ok;
  });
  it('func instance should have text representation', function () {
    var func = _dfunc["default"].createFuncInstance('top');

    func.params[0] = 5;
    func.params[1] = 'mean';
    func.params[2] = 'dir';
    func.updateText();
    expect(func.text).to.equal("top(5, mean, dir)");
  });
});
describe('when rendering func instance', function () {
  it('should handle single metric param', function () {
    var func = _dfunc["default"].createFuncInstance('abs');

    expect(func.render('a')).to.equal("abs(a)");
  });
  it('should include default params if options enable it', function () {
    var func = _dfunc["default"].createFuncInstance('top', {
      withDefaultParams: true
    });

    expect(func.render('a')).to.equal("top(a, 5, mean, dir)");
  });
  it('should handle int or interval params with number', function () {
    var func = _dfunc["default"].createFuncInstance('anomalies');

    func.params[0] = 'basic';
    func.params[1] = '5';
    expect(func.render('hello')).to.equal("anomalies(hello, basic, 5)");
  });
});
describe('when requesting function categories', function () {
  it('should return function categories', function () {
    var catIndex = _dfunc["default"].getCategories();

    expect(catIndex.Arithmatic.length).to.be.greaterThan(3);
  });
});
describe('when updating func param', function () {
  it('should update param value and update text representation', function () {
    var func = _dfunc["default"].createFuncInstance('top', {
      withDefaultParams: true
    });

    func.updateParam('10', 0);
    expect(func.params[0]).to.be.equal('10');
    func.updateText();
    expect(func.text).to.be.equal('top(10, mean, dir)');
  });
  it('should parse numbers as float', function () {
    var func = _dfunc["default"].createFuncInstance('outliers');

    func.updateParam('0.5', 1);
    expect(func.params[1]).to.be.equal('0.5');
  });
});
describe('when updating func param with optional second parameter', function () {
  it('should update value and text', function () {
    var func = _dfunc["default"].createFuncInstance('fill');

    func.updateParam('null', 0);
    expect(func.params[0]).to.be.equal('null');
  });
});
//# sourceMappingURL=dfunc_spec.js.map
