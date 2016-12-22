import {DataDogDatasource} from './datasource';
import {DataDogQueryCtrl} from './query_ctrl';

class DataDogConfigCtrl {};
DataDogConfigCtrl.templateUrl = "partials/config.html";

class DataDogQueryOptionsCtrl {};
DataDogQueryOptionsCtrl.templateUrl = "partials/query.options.html";


export {
  DataDogDatasource as Datasource,
  DataDogQueryCtrl as QueryCtrl,
  DataDogConfigCtrl as ConfigCtrl,
  DataDogQueryOptionsCtrl as QueryOptionsCtrl,
}
