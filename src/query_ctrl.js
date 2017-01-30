import _ from 'lodash';
import dfunc from './dfunc';
import {QueryCtrl} from 'app/plugins/sdk';
import './func_editor';
import './add_datadog_func';
import * as queryBuilder from './query_builder';

export class DataDogQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv, templateSrv)  {
    super($scope, $injector);
    this.removeText = '-- remove tag --';
    this.uiSegmentSrv = uiSegmentSrv;
    this.templateSrv = templateSrv;

    if (this.target.aggregation) {
      this.aggregationSegment = new uiSegmentSrv.newSegment(
        this.target.aggregation
      );
    } else {
      this.aggregationSegment = new uiSegmentSrv.newSegment({
        value: 'Select Aggregation',
        fake: true,
        custom: false,
      });
    }

    if (this.target.metric) {
      this.metricSegment = new uiSegmentSrv.newSegment(
        this.target.metric
      );
    } else {
      this.metricSegment = new uiSegmentSrv.newSegment({
        value: 'Select Metric',
        fake: true,
        custom: false,
      });
    }

    this.target.tags = this.target.tags || [];
    this.tagSegments = this.target.tags.map(uiSegmentSrv.newSegment);
    this.fixTagSegments();

    this.functions = [];
    this.target.functions = this.target.functions || [];
    this.functions = _.map(this.target.functions, func => {
      var f = dfunc.createFuncInstance(func.funcDef, {withDefaultParams: false});
      f.params = func.params.slice();
      return f;
    });

    if (this.target.as) {
      this.asSegment = uiSegmentSrv.newSegment(this.target.as);
    } else {
      this.asSegment = uiSegmentSrv.newSegment({
        value: 'Select As',
        fake: true,
        custom: false,
      });
    }

  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  getMetrics() {
    return this.datasource.metricFindQuery()
    .then(this.uiSegmentSrv.transformToSegments(true));
  }

  getAggregations() {
    return Promise.resolve([
      {text: 'avg by', value: 'avg'},
      {text: 'max by', value: 'max'},
      {text: 'min by', value: 'min'},
      {text: 'sub by', value: 'sum'},
    ]);
  }

  getAs() {
    return Promise.resolve([
      {text: 'None', value: 'None'},
      {text: 'as_count', value: 'as_count'},
      {text: 'as_rate', value: 'as_rate'},
    ]);
  }

  getTags(segment) {
    return this.datasource.metricFindTags()
    .then(this.uiSegmentSrv.transformToSegments(false))
    .then(results => {
      if (segment.type !== 'plus-button') {
        let removeSegment = this.uiSegmentSrv.newFake(this.removeText);
        results.unshift(removeSegment);
      }

      return results;
    });
  }

  aggregationChanged() {
    this.target.aggregation = this.aggregationSegment.value;
    this.panelCtrl.refresh();
  }

  metricChanged() {
    this.target.metric = this.metricSegment.value;
    this.panelCtrl.refresh();
  }

  asChanged() {
    if (this.asSegment.value === 'None') {
      this.target.as = null;
    } else {
      this.target.as = this.asSegment.value;
    }
    this.panelCtrl.refresh();
  }

  fixTagSegments() {
    var count = this.tagSegments.length;
    var lastSegment = this.tagSegments[Math.max(count-1, 0)];

    if (!lastSegment || lastSegment.type !== 'plus-button') {
      this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
    }
  }

  targetChanged() {
    if (this.error) {
      return;
    }

    this.panelCtrl.refresh();
  }

  persistFunctions () {
    this.target.functions = _.map(this.functions, func => {
      return {
        funcDef: func.def.name,
        params: func.params.slice(),
      };
    });
  }

  removeFunction(func) {
    this.functions = _.without(this.functions, func);
    this.persistFunctions();
    this.targetChanged();
  }

  addFunction(funcDef) {
    var func = dfunc.createFuncInstance(funcDef, {withDefaultParams: true});
    func.added = true;
    this.functions.push(func);
    this.persistFunctions();
    this.targetChanged();
  }

  tagSegmentUpdated(segment, index) {
    if (segment.value === this.removeText) {
      this.tagSegments.splice(index, 1);
    }

    let realSegments = _.filter(this.tagSegments, segment => segment.value);
    this.target.tags = realSegments.map(segment => segment.value);

    this.tagSegments = _.map(this.target.tags, this.uiSegmentSrv.newSegment);
    this.fixTagSegments();

    this.panelCtrl.refresh();
  }

  getCollapsedText() {
    if (this.target.rawQuery) {
      return this.target.query;
    } else {
      return queryBuilder.buildQuery(this.target);
    }
  }
}

DataDogQueryCtrl.templateUrl = 'partials/query.editor.html';
