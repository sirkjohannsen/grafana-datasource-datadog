# Datadog Grafana Datasource Plugin

![Build Passing](https://travis-ci.org/voidfiles/grafana-datasource-datadog.svg?branch=master)

Datadog has a nice dashboard system, but I was having trouble creating a dashboard that combined multiple datasources and grafana was the easiest way to bring it all together.

## To Contribute

Fork, make your change, and submit a Pull Request. Make sure you add tests where approprate, and don't break exisisting tests.

## Usage

### Query Editor
![query editor](https://cloud.githubusercontent.com/assets/4932851/22584216/337c26aa-ea02-11e6-84a8-20207bedd15b.png)

It's easy - select aggregation and metric. If you want to filter result, select one or more tags.

DataDog datasource supports advanced functions. Select it from dropdown and arrange by clicking function name.

### Annotations
![annotations editor](https://cloud.githubusercontent.com/assets/4932851/22584362/1705598c-ea03-11e6-94a0-b51435d74420.png)

Annotations allows to get events from DataDog and display it on graph. You can filter events by sources, tags and priority.

### Templating
There are two options for getting values of tempate variable - metrics and tags. For fetching list of available metrics leave _Query_ field blank or specify `*`. For tags type `tag`. Filter results by using _Regex_ field. Multi-value variables are supported for using in tags (selected values will be converted into comma separated list of tags).

#### Ad-hoc filters
There's new special type of template variable in Grafana called _Ad-hoc filters_. This variable will apply to _all_ DataDog queries on dashboard (all with specified datasource). This alollows to use it like a quick filter. Ad-hoc variable for DataDog fetches all key-value pairs from tags, for example, `region:east, region:west`, and use it as queries tags. To create this variable, select _Ad-hoc filters_ type and choose your DataDog datasource. You can set any name to this variable.

