# Datadog Grafana Datasource Plugin

Datadog has a nice dashboard system, and will always be better than the grafana dashboard, but I was having trouble creating a dashboard that combined multiple datasources and grafan was the eaiest way to bring it all together.

## Documentation


## Alternative installation method - Clone into plugins directory
Either clone this repo into your grafana plugins directory (default /var/lib/grafana/plugins if your installing grafana with package).
Restart grafana-server and the plugin should be automatically detected and used.

```
git clone git@github.com:grafana/datasource-plugin-kairosdb.git
sudo service grafana-server restart
```


## Clone into a directory of your choice

The edit your grafana.ini config file (Default location is at /etc/grafana/grafana.ini) and add this:

```ini
[plugin.datadog]
path = /home/your/clone/dir/datasource-plugin-kairosdb
```

Note that if you clone it into the grafana plugins directory you do not need to add the above config option. That is only
if you want to place the plugin in a directory outside the standard plugins directory. Be aware that grafana-server
needs read access to the directory.
