package plugin

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type OracleDatasourceQuery struct {
	Datasource          OracleDatasourceInfo
	DatasourceId        int64
	IntervalMs          int64
	O_parsed            string
	O_sql               string
	RefId               string
	Format              string
	O_override_hostname string
	O_override_port     int
	O_override_service  string
}

type OracleDatasourceInfo struct {
	Type string
	Uid  string
}

type OracleDatasourceColumn struct {
	name     string
	dataType string
	values   []any
}

type OracleDatasourceResult struct {
	err     error
	columns []OracleDatasourceColumn
}

func (q *OracleDatasourceQuery) MakeQuery(c *OracleDatasourceConnection, from time.Time, to time.Time) OracleDatasourceResult {
	result := OracleDatasourceResult{nil, []OracleDatasourceColumn{}}

	if c.IsConnected() {
		stmt, err := c.connection.Prepare(q.O_parsed)
		if err != nil {
			log.DefaultLogger.Error("Error preparing SQL: ", err)
			result.err = err
			return result
		}
		defer stmt.Close()

		rows, err := stmt.Query()
		if err != nil {
			log.DefaultLogger.Error("Error querying SQL: ", err)
			result.err = err
			return result
		}
		defer rows.Close()

		columnTypes, err := rows.ColumnTypes()
		columns := []string{}
		typeMap := make(map[string]string)
		if err != nil {
			log.DefaultLogger.Error("Error fetching columns: ", err)
			result.err = err
			return result
		} else {
			for _, column := range columnTypes {
				name := column.Name()
				typename := GetDataTypeByType(column.ScanType())
				log.DefaultLogger.Debug(fmt.Sprintf("column: %v, dataType:%v", name, typename))

				typeMap[name] = typename
				columns = append(columns, name)
				result.columns = append(result.columns, OracleDatasourceColumn{name, typename, []any{}})
			}
		}
		log.DefaultLogger.Debug("Oracle query fetch: ", "columns", columns)

		sacnValues := make([]sql.RawBytes, len(columns))
		scanArgs := make([]interface{}, len(columns))
		for i := range scanArgs {
			scanArgs[i] = &sacnValues[i]
		}

		for rows.Next() {
			err := rows.Scan(scanArgs...)
			if err != nil {
				log.DefaultLogger.Error("Error scanning row: ", err)
				break
			}
			for index, scannedValue := range sacnValues {
				if scannedValue != nil {
					dataType := typeMap[result.columns[index].name]
					convertedValue := ConvertValue(scannedValue, dataType)
					result.columns[index].values = append(result.columns[index].values, convertedValue)
				} else {
					result.columns[index].values = append(result.columns[index].values, nil)
				}
			}
		}

		if rows.Err() != nil && rows.Err() != io.EOF {
			result.err = err
			log.DefaultLogger.Error("Error fetching row: ", err)
		}
	}

	log.DefaultLogger.Debug("Oracle query: ", "result", result)
	return result
}

func (q *OracleDatasourceQuery) ParseDatasourceQuery(query backend.DataQuery) error {
	log.DefaultLogger.Debug("backend query", "json", query.JSON)
	err := json.Unmarshal(query.JSON, &q)
	if err != nil {
		log.DefaultLogger.Error("Error parsing Oracle query: ", err)
	}
	return err
}

// HasConnectionOverrides checks if any connection override fields are set
func (q *OracleDatasourceQuery) HasConnectionOverrides() bool {
	return q.O_override_hostname != "" || q.O_override_port != 0 || q.O_override_service != ""
}

// MakeQueryWithOverride executes a query using an override connection
func (q *OracleDatasourceQuery) MakeQueryWithOverride(baseSettings *OracleDatasourceSettings, from time.Time, to time.Time) OracleDatasourceResult {
	result := OracleDatasourceResult{nil, []OracleDatasourceColumn{}}

	// Create override settings based on base settings
	overrideSettings := *baseSettings

	// Clear connection string so individual parameters are used
	// Connection string takes precedence, so we must clear it when using overrides
	overrideSettings.O_connStr = ""

	// Apply overrides
	if q.O_override_hostname != "" {
		overrideSettings.O_hostname = q.O_override_hostname
	}
	if q.O_override_port != 0 {
		overrideSettings.O_port = q.O_override_port
	}
	if q.O_override_service != "" {
		overrideSettings.O_service = q.O_override_service
	}

	log.DefaultLogger.Debug("Using connection overrides",
		"hostname", overrideSettings.O_hostname,
		"port", overrideSettings.O_port,
		"service", overrideSettings.O_service)

	// Create temporary connection with override settings
	tempConnection := OracleDatasourceConnection{}
	err := tempConnection.Connect(&overrideSettings)
	if err != nil {
		log.DefaultLogger.Error("Error connecting with overrides: ", err)
		result.err = err
		return result
	}
	defer tempConnection.Disconnect()

	// Execute query using the temporary connection
	result = q.MakeQuery(&tempConnection, from, to)

	return result
}
