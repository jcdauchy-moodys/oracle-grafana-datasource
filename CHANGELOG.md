# Oracle Grafana Changelog

## 2.0.0

### Added
* **Advanced SQL Editor with Monaco Editor**: PostgreSQL-style query editor with syntax highlighting and validation
  - Full Oracle SQL syntax highlighting (keywords, functions, system views)
  - Real-time query validation with error markers
  - Auto-completion for SQL keywords and Oracle functions
  - Context-aware suggestions and IntelliSense
  - Error messages on hover
  - Line numbers and code folding
  - Auto-closing brackets, parentheses, and quotes
  - Side-by-side query preview showing variable interpolation
  - See SQL_EDITOR_FEATURES.md for complete documentation
* **Dynamic Connection Overrides**: Query-level connection parameter overrides (hostname, port, service name, SID)
  - Allows targeting different Oracle databases using the same datasource credentials
  - Useful for multi-environment monitoring and dynamic database targeting
  - See DYNAMIC_CONNECTION_OVERRIDES.md for detailed documentation
* **Time series format support** for graph visualizations
  - Wide format: timestamp + multiple value columns
  - Long format: timestamp, metric_name, value
  - Automatic detection of time columns
  - See TIMESERIES_FORMAT.md for details

### Changed
* Query editor replaced TextArea with Monaco-based CodeEditor component
* Query editor UI enhanced with collapsible "Connection Overrides" section
* Backend query execution now supports temporary connections for override queries
* Added monaco-editor as a dependency


## 1.0.1 
* support alerting
* support retrieve number/time/string

## 1.0.0 (Unreleased)

Initial release as a Datasource with internal backend support.

### Added
* Github Actions for making releases
* Scripts to make release files and update dev containers
* Support for variables on queries
* Support for Query variables

### Removed
* Dockerfile
* GitLab CI/CD
* NodeJs external service
* Pod for develop
* SonarQube scan (for now)

### Updated
* CHANGELOG file
* Config editor refactor to group information
* Docker compose file to develop
* Examples images
* Grafana framework
* Libraries
* README file
* Query editor refactor with SQL preview

## 0.9.0 (unreleased)

Import from https://github.com/JamesOsgood/mongodb-grafana

### Added
* Simple SELECT queries now works
* Dockerfile for containering
* Entire server rewrite using ES2020
* Examples with images and queries
* GitLab CI/CD
* Lint scan
* Oracle driver
* Winston/Morgan logger
* Pod for develop
* SonarQube scan

### Removed
* MongoDb driver

### Updated
* Lib updates

---
# TODO
* SonarQube scan
* Real tests
* Multiple value variables
