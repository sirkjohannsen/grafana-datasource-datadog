"use strict";

var _angular = _interopRequireDefault(require("angular"));

var _lodash = _interopRequireDefault(require("lodash"));

var _jquery = _interopRequireDefault(require("jquery"));

var _dfunc = _interopRequireDefault(require("./dfunc"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_angular["default"].module('grafana.directives').directive('datadogAddFunc', function ($compile) {
  var inputTemplate = '<input type="text"' + ' class="gf-form-input"' + ' spellcheck="false" style="display:none"></input>';
  var buttonTemplate = '<a  class="gf-form-label query-part dropdown-toggle"' + ' tabindex="1" gf-dropdown="functionMenu" data-toggle="dropdown">' + '<i class="fa fa-plus"></i></a>';
  return {
    link: function link($scope, elem) {
      var categories = _dfunc["default"].getCategories();

      var allFunctions = getAllFunctionNames(categories);
      var ctrl = $scope.ctrl;
      $scope.functionMenu = createFunctionDropDownMenu(categories);
      var $input = (0, _jquery["default"])(inputTemplate);
      var $button = (0, _jquery["default"])(buttonTemplate);
      $input.appendTo(elem);
      $button.appendTo(elem);
      $input.attr('data-provide', 'typeahead');
      $input.typeahead({
        source: allFunctions,
        minLength: 1,
        items: 10,
        updater: function updater(value) {
          var funcDef = _dfunc["default"].getFuncDef(value);

          if (!funcDef) {
            // try find close match
            value = value.toLowerCase();
            funcDef = _lodash["default"].find(allFunctions, function (funcName) {
              return funcName.toLowerCase().indexOf(value) === 0;
            });

            if (!funcDef) {
              return;
            }
          }

          $scope.$apply(function () {
            ctrl.addFunction(funcDef);
          });
          $input.trigger('blur');
          return '';
        }
      });
      $button.click(function () {
        $button.hide();
        $input.show();
        $input.focus();
      });
      $input.keyup(function () {
        elem.toggleClass('open', $input.val() === '');
      });
      $input.blur(function () {
        // clicking the function dropdown menu wont
        // work if you remove class at once
        setTimeout(function () {
          $input.val('');
          $input.hide();
          $button.show();
          elem.removeClass('open');
        }, 200);
      });
      $compile(elem.contents())($scope);
    }
  };
});

function getAllFunctionNames(categories) {
  return _lodash["default"].reduce(categories, function (list, category) {
    _lodash["default"].each(category, function (func) {
      list.push(func.name);
    });

    return list;
  }, []);
}

function createFunctionDropDownMenu(categories) {
  return _lodash["default"].map(categories, function (list, category) {
    return {
      text: category,
      submenu: _lodash["default"].map(list, function (value) {
        return {
          text: value.name,
          click: "ctrl.addFunction('" + value.name + "')"
        };
      })
    };
  });
}
//# sourceMappingURL=add_datadog_func.js.map
