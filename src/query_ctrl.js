import _ from 'lodash';
import dfunc from './dfunc';
import {QueryCtrl} from 'app/plugins/sdk';
import './func_editor';
import './add_datadog_func';
import * as queryBuilder from './query_builder';

export class DataDogQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, $q, uiSegmentSrv)  {
    super($scope, $injector);
    this.removeText = '-- remove tag --';
    this.$q = $q;
    this.uiSegmentSrv = uiSegmentSrv;
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

    this.tagSegments = [];
    var self = this;
    this.target.tags = this.target.tags || [];
    _.map(this.target.tags, function (tag) {
      self.tagSegments.push(uiSegmentSrv.newSegment(tag));
    });

    this.fixTagSegments();

    this.functions = [];
    this.target.functions = this.target.functions || [];
    _.map(this.target.functions, function (func) {
      var f = dfunc.createFuncInstance(func.funcDef, {withDefaultParams: false});
      f.params = func.params.slice();
      self.functions.push(f);
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
    return this.datasource.metricFindQuery();
  }

  getAggregations() {
    return this.$q.when([
      {text: 'avg by', value: 'avg'},
      {text: 'max by', value: 'max'},
      {text: 'min by', value: 'min'},
      {text: 'sub by', value: 'sum'},
    ]);
  }

  getAs() {
    return this.$q.when([
      {text: 'None', value: 'None'},
      {text: 'as_count', value: 'as_count'},
      {text: 'as_rate', value: 'as_rate'},
    ]);
  }

  getTags(segment) {
    var self = this;
    return this.datasource.metricFindTags().then(function (results) {
      var first = results && results[0];
      var resultsHaveRemoveText = first && first.text === self.removeText;
      var segmentIsPlusButton = segment.type === 'plus-button';
      // var removeResultsText = resultsHaveRemoveText && segmentIsPlusButton;
      if (resultsHaveRemoveText) {
        results.splice(0, 1);
      }

      if (!segmentIsPlusButton) {
        results.splice(0, 0, {text: self.removeText, value: self.removeText});
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
    console.log("target segments", this.tagSegments);
    this.target.tags = _.filter(_.map(this.tagSegments, function (segment) {
      return segment.value;
    }));
    console.log("setting target tags", this.target.tags);
    this.panelCtrl.refresh();

    var count = this.tagSegments.length;
    var lastSegment = this.tagSegments[Math.max(count-1, 0)];

    if (!lastSegment || lastSegment.type !== 'plus-button') {
      this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
    }
  }

  getCollapsedText() {
    return queryBuilder.buildQuery(this.target);
  }
}

DataDogQueryCtrl.templateUrl = 'partials/query.editor.html';
