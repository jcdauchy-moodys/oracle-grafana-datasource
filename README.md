# Oracle Grafana data source plugin

Plugin for translating Oracle queries (SELECT) to grafana dashboards.

It has support for Quey variables and simple variables on SQL preview.

Variable with multiple values will be supported in the future.

## Requirements
* Grafana 9.5+
* Oracle 12+

## Plugin Installation
Grafana servers can load plugins usualy from the /var/lib/grafana/plugins folder, so extract the albertowd-oraclegrafana-datasource-bundle-1.0.0.tar.gz to this folder.

From there, the plugin can be found, but will not be automatically installed without the `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=albertowd-oraclegrafana-datasource` environment variable or `allow_loading_unsigned_plugins=albertowd-oraclegrafana-datasource` in tue grafana.ini file defining the plugin id.

Restart the grafana server and then the new data source must be visible at the Data source creation list:

![Grafana datasource list](example/images/datasource-list.png)

## Configuration

The configuration can be configured using the simple fields or using the `ConnString` field ignoring the others.

![Grafana datasource configuration](example/images/datasource-config.png)

### Dynamic Connection Overrides

The plugin supports **dynamic connection overrides** at the query level, allowing you to target different Oracle databases while using the same datasource credentials. This is useful for:
- Multi-environment monitoring (dev/staging/prod)
- Multi-database dashboards
- Dynamic database targeting using Grafana variables

In the query editor, expand "Connection Overrides (Optional)" to override:
- **Hostname**: Target a different Oracle server
- **Port**: Use a different port number
- **Service Name**: Connect to a different Oracle service

**Important Notes**: 
- Connection overrides only change WHERE you connect. Credentials (username/password) always come from the datasource configuration for security.
- ⚠️ **For overrides to work**, configure your datasource using individual fields (Hostname, Port, Service Name) rather than a connection string (ConnString). Leave the ConnString field empty.

For detailed documentation and examples, see [DYNAMIC_CONNECTION_OVERRIDES.md](DYNAMIC_CONNECTION_OVERRIDES.md).

## Queries
The plugin only support the SELECT query.

### Advanced SQL Editor

The query editor features a **Monaco-based SQL editor** (the same editor used in VS Code) with:

- **Syntax Highlighting**: Full Oracle SQL syntax highlighting including keywords, functions, and system views
- **Real-time Validation**: Instant feedback on syntax errors with red squiggly lines
- **Auto-Completion**: Context-aware suggestions for SQL keywords and Oracle functions
- **Error Messages**: Hover over errors to see detailed descriptions
- **Line Numbers**: Easy navigation with visible line numbers
- **Auto-Closing**: Automatic closing of brackets, parentheses, and quotes
- **Query Preview**: Side-by-side view showing how variables will be interpolated

For complete details on editor features, see [SQL_EDITOR_FEATURES.md](SQL_EDITOR_FEATURES.md).

### Variable Substitution

The query editor includes a preview feature showing how the query will execute after replacing all Grafana variables.

It can use any simple variable created on the Grafana instance, just prefix the variable name with `$` on the query editor.

It includes the default ones too: `$__from` and `$__to` from the dashboard:

![Grafana query editor](example/images/query-preview.png)

## Format Options

The plugin supports two query result formats:

### Table Format (Default)
Returns data in tabular format suitable for table visualizations.

### Time Series Format
Automatically converts query results to time series format for time-based visualizations like graphs and time series panels.

**Requirements for time series format:**
- Query must include a time/date column (column name containing "time" or "date")
- One or more numeric value columns

**Supported data layouts:**
1. **Wide format**: `timestamp, metric1, metric2, metric3...` (one series per column)
2. **Long format**: `timestamp, metric_name, value` (one series per unique metric name)

For detailed information and examples, see [TIMESERIES_FORMAT.md](TIMESERIES_FORMAT.md).

**Example wide format query:**
```sql
SELECT 
    sample_time AS time,
    AVG(cpu_percent) AS cpu_usage,
    AVG(memory_percent) AS memory_usage
FROM v$sysmetric_history
WHERE sample_time BETWEEN $__from AND $__to
GROUP BY sample_time
ORDER BY sample_time
```

![Grafana query editor](example/images/query-preview-timeseries.png)

## Query Variables
Also, it can be configured variables using the data source as well, with custom SQL that returns only one column:

![Grafana query editor](example/images/query-variable.png)

And then using it on the query editor and dashboards using the dropdown variable:

![Grafana query editor](example/images/query-preview-variable.png)
