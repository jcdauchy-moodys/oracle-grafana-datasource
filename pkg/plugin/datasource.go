package plugin

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"

	_ "github.com/sijms/go-ora/v2"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces- only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*OracleDatasource)(nil)
	_ backend.CheckHealthHandler    = (*OracleDatasource)(nil)
	_ instancemgmt.InstanceDisposer = (*OracleDatasource)(nil)
)

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type OracleDatasource struct {
	connection OracleDatasourceConnection
	name       string
	settings   OracleDatasourceSettings
}

// NewDatasource creates a new datasource instance.
func NewDatasource(settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	datasourceSettings := ParseDatasourceSettings(settings.JSONData, settings.DecryptedSecureJSONData)
	log.DefaultLogger.Debug("New datasource", "name", settings.Name, "settings", datasourceSettings)
	return &OracleDatasource{OracleDatasourceConnection{}, settings.Name, datasourceSettings}, nil
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *OracleDatasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	message := "Oracle datasource succesfully connected!"
	status := backend.HealthStatusOk

	d.name = req.PluginContext.DataSourceInstanceSettings.Name
	d.settings = ParseDatasourceSettings(req.PluginContext.DataSourceInstanceSettings.JSONData, req.PluginContext.DataSourceInstanceSettings.DecryptedSecureJSONData)
	log.DefaultLogger.Debug("Health check datasource settings", "name", d.name, "object", d.settings)

	err := d.connection.Reconnect(&d.settings)
	if err != nil {
		message = "Health check error: " + err.Error()
		status = backend.HealthStatusError
	}

	return &backend.CheckHealthResult{
		Message: message,
		Status:  status,
	}, nil
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *OracleDatasource) Dispose() {
	// Clean up datasource instance resources.
	err := d.connection.Disconnect()
	if err != nil {
		log.DefaultLogger.Error("Error closing Oracle connection: ", err)
	}
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *OracleDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// create response struct
	var err error
	response := backend.NewQueryDataResponse()

	if !d.connection.IsConnected() {
		err = d.connection.Connect(&d.settings)
	}

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		if err != nil {
			response.Responses[q.RefID] = backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("Error connecting datasource: %v", err.Error()))
		} else {
			res := d.query(ctx, req.PluginContext, q)
			// save the response in a hashmap
			// based on with RefID as identifier
			response.Responses[q.RefID] = res
		}
	}

	return response, nil
}

type queryModel struct{}

func (d *OracleDatasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse

	queryObj := OracleDatasourceQuery{}
	err := queryObj.ParseDatasourceQuery(query)
	log.DefaultLogger.Debug(fmt.Sprintf("Executing new query: %+v", queryObj))
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("Error parsing query: %v", err.Error()))
	}

	var result OracleDatasourceResult

	// Check if connection overrides are specified
	if queryObj.HasConnectionOverrides() {
		log.DefaultLogger.Debug("Query has connection overrides, using temporary connection")
		result = queryObj.MakeQueryWithOverride(&d.settings, query.TimeRange.From, query.TimeRange.To)
	} else {
		// Use the default datasource connection
		result = queryObj.MakeQuery(&d.connection, query.TimeRange.From, query.TimeRange.To)
	}

	if result.err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("Error executing query: %v", result.err.Error()))
	}

	// Determine format (default to table if not specified)
	format := queryObj.Format
	if format == "" {
		format = "table"
	}

	var frames data.Frames

	if format == "timeseries" {
		// Convert to timeseries format
		frames, err = convertToTimeSeriesFrames(result.columns, query.RefID)
		if err != nil {
			return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("Error converting to timeseries: %v", err.Error()))
		}
	} else {
		// Default table format
		frame := data.NewFrame("response")
		for _, column := range result.columns {
			values := ConvertValueArray(column.dataType, column.values)
			frame.Fields = append(frame.Fields, data.NewField(column.name, nil, values))
		}
		frames = append(frames, frame)
	}

	// add the frames to the response.
	response.Frames = frames

	return response
}

// convertToTimeSeriesFrames converts query results to time series format
// Supports two formats:
// 1. Wide format: timestamp, metric1, metric2, ... (one row per time point)
// 2. Long format: timestamp, metric_name, value (multiple rows per time point)
func convertToTimeSeriesFrames(columns []OracleDatasourceColumn, refID string) (data.Frames, error) {
	if len(columns) == 0 {
		return nil, fmt.Errorf("no columns in result set")
	}

	// Find time column (first column with time/timestamp in name or first time.Time column)
	timeColumnIdx := -1
	for i, col := range columns {
		colNameLower := strings.ToLower(col.name)
		if strings.Contains(colNameLower, "time") || strings.Contains(colNameLower, "date") || col.dataType == "time" {
			timeColumnIdx = i
			break
		}
	}

	if timeColumnIdx == -1 {
		return nil, fmt.Errorf("no time column found in result set. Time column must contain 'time' or 'date' in its name")
	}

	timeColumn := columns[timeColumnIdx]
	if len(timeColumn.values) == 0 {
		return nil, fmt.Errorf("time column has no values")
	}

	// Convert time column values
	timeValues := ConvertValueArray(timeColumn.dataType, timeColumn.values)

	// Check if we have a time array (ConvertValueArray returns []time.Time, not []*time.Time)
	timeArray, ok := timeValues.([]time.Time)
	if !ok {
		return nil, fmt.Errorf("time column is not of time type, got: %T", timeValues)
	}

	// Detect format: if we have exactly 3 columns and one is named something like 'metric', 'name', 'label', it's long format
	// Otherwise, it's wide format
	isLongFormat := false
	metricNameIdx := -1
	valueIdx := -1

	if len(columns) == 3 {
		for i, col := range columns {
			if i == timeColumnIdx {
				continue
			}
			colNameLower := strings.ToLower(col.name)
			if strings.Contains(colNameLower, "metric") || strings.Contains(colNameLower, "name") ||
				strings.Contains(colNameLower, "label") || strings.Contains(colNameLower, "series") {
				metricNameIdx = i
				isLongFormat = true
			} else if strings.Contains(colNameLower, "value") || col.dataType == "float64" || col.dataType == "int64" {
				valueIdx = i
			}
		}
		// If we found both metric name and value columns, it's long format
		if metricNameIdx != -1 && valueIdx != -1 {
			isLongFormat = true
		} else {
			isLongFormat = false
		}
	}

	var frames data.Frames

	if isLongFormat {
		// Long format: convert to multiple series
		frames = convertLongFormat(timeArray, columns, timeColumnIdx, metricNameIdx, valueIdx, refID)
	} else {
		// Wide format: each column (except time) becomes a series
		frames = convertWideFormat(timeArray, columns, timeColumnIdx, refID)
	}

	return frames, nil
}

// convertWideFormat converts wide format data (timestamp, value1, value2, ...) to time series frames
func convertWideFormat(timeValues []time.Time, columns []OracleDatasourceColumn, timeColumnIdx int, refID string) data.Frames {
	var frames data.Frames

	for i, col := range columns {
		if i == timeColumnIdx {
			continue // Skip time column
		}

		// Create a frame for each value column
		frame := data.NewFrame(col.name)

		// Add time field (convert to pointers as required by Grafana)
		frame.Fields = append(frame.Fields, data.NewField("time", nil, convertTimeSliceToPointers(timeValues)))

		// Add value field
		values := ConvertValueArray(col.dataType, col.values)
		frame.Fields = append(frame.Fields, data.NewField(col.name, nil, values))

		// Set frame metadata for time series
		frame.Meta = &data.FrameMeta{
			PreferredVisualization: data.VisTypeGraph,
		}

		frames = append(frames, frame)
	}

	return frames
}

// convertLongFormat converts long format data (timestamp, metric_name, value) to time series frames
func convertLongFormat(timeValues []time.Time, columns []OracleDatasourceColumn, timeColumnIdx, metricNameIdx, valueIdx int, refID string) data.Frames {
	// Group by metric name
	seriesMap := make(map[string]*seriesData)

	metricNames := columns[metricNameIdx].values
	values := columns[valueIdx].values

	for i := 0; i < len(timeValues); i++ {
		if i >= len(metricNames) || i >= len(values) {
			break
		}

		metricName := fmt.Sprintf("%v", metricNames[i])

		if _, exists := seriesMap[metricName]; !exists {
			seriesMap[metricName] = &seriesData{
				name:   metricName,
				times:  []time.Time{},
				values: []interface{}{},
			}
		}

		seriesMap[metricName].times = append(seriesMap[metricName].times, timeValues[i])
		seriesMap[metricName].values = append(seriesMap[metricName].values, values[i])
	}

	// Convert to frames
	var frames data.Frames
	valueDataType := columns[valueIdx].dataType

	for _, series := range seriesMap {
		frame := data.NewFrame(series.name)

		// Add time field (convert to pointers as required by Grafana)
		frame.Fields = append(frame.Fields, data.NewField("time", nil, convertTimeSliceToPointers(series.times)))

		// Add value field
		convertedValues := ConvertValueArray(valueDataType, series.values)
		frame.Fields = append(frame.Fields, data.NewField(series.name, nil, convertedValues))

		// Set frame metadata for time series
		frame.Meta = &data.FrameMeta{
			PreferredVisualization: data.VisTypeGraph,
		}

		frames = append(frames, frame)
	}

	return frames
}

// Helper struct for organizing series data in long format
type seriesData struct {
	name   string
	times  []time.Time
	values []interface{}
}

// convertTimeSliceToPointers converts []time.Time to []*time.Time as required by Grafana data frames
func convertTimeSliceToPointers(times []time.Time) []*time.Time {
	result := make([]*time.Time, len(times))
	for i := range times {
		result[i] = &times[i]
	}
	return result
}
