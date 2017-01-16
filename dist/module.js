'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var DataDogDatasource, DataDogQueryCtrl, DataDogConfigCtrl, DataDogQueryOptionsCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      DataDogDatasource = _datasource.DataDogDatasource;
    }, function (_query_ctrl) {
      DataDogQueryCtrl = _query_ctrl.DataDogQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', DataDogConfigCtrl = function DataDogConfigCtrl() {
        _classCallCheck(this, DataDogConfigCtrl);
      });

      DataDogConfigCtrl.templateUrl = "partials/config.html";

      _export('QueryOptionsCtrl', DataDogQueryOptionsCtrl = function DataDogQueryOptionsCtrl() {
        _classCallCheck(this, DataDogQueryOptionsCtrl);
      });

      DataDogQueryOptionsCtrl.templateUrl = "partials/query.options.html";

      _export('Datasource', DataDogDatasource);

      _export('QueryCtrl', DataDogQueryCtrl);

      _export('ConfigCtrl', DataDogConfigCtrl);

      _export('QueryOptionsCtrl', DataDogQueryOptionsCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
