import { DataSourceInstanceSettings, CoreApp, MetricFindValue, dateTime, DataFrame, DataQueryRequest, DataQueryResponse } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { Observable, lastValueFrom, map, switchMap } from 'rxjs';

import { interpolate } from './interpolate';
import { MyQuery, MyDataSourceOptions } from './types';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  query(request: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const templateSrv = getTemplateSrv();
    
    for(const query of request.targets) {
      // Interpolate SQL query with scoped vars if available
      if (request.scopedVars && Object.keys(request.scopedVars).length > 0) {
        query.o_parsed = interpolate(query.o_sql || '', request.scopedVars);
      }
      
      // Interpolate connection override fields to support template variables
      // These work with both scoped vars and dashboard variables
      if (query.o_override_hostname) {
        query.o_override_hostname = templateSrv.replace(query.o_override_hostname, request.scopedVars);
      }
      if (query.o_override_service) {
        query.o_override_service = templateSrv.replace(query.o_override_service, request.scopedVars);
      }
      // Port is numeric, but may be entered as a variable - handle string conversion
      if (query.o_override_port) {
        const portStr = String(query.o_override_port);
        const interpolatedPort = templateSrv.replace(portStr, request.scopedVars);
        const parsedPort = parseInt(interpolatedPort, 10);
        query.o_override_port = isNaN(parsedPort) ? undefined : parsedPort;
      }
    }
    return super.query(request)
  }

  /**
   * Method implemented to use the Query variable available to this datasource.
   * @param query User defined query.
   * @param options Query options.
   * @returns 
   */
  async metricFindQuery(query: string, options?: any): Promise<MetricFindValue[]> {
    if (!query) {
      return Promise.resolve([]);
    }

    const response = this.query({
      interval: '',
      intervalMs: 0,
      requestId: 'metricFindQuery',
      range: {
        from: dateTime(),
        to: dateTime(),
        raw: {
          from: dateTime(),
          to: dateTime()
        }
      },
      scopedVars: {},
      targets: [{
        datasource: this.getDefaultQuery(CoreApp.Unknown).datasource,
        o_parsed: query,
        refId: 'A'
      }],
      timezone: 'Z',
      app: '',
      startTime: 0,
    });

    return lastValueFrom(response.pipe(
      switchMap(response => response.data),
      switchMap((data: DataFrame) => data.fields),
      map(field =>
        field.values.toArray().map(value => {
          return { text: value };
        })
      )
    ));
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return {
      o_sql: 'SELECT * \n FROM SYS.races \nWHERE data BETWEEN $__from AND $__to',
      format: 'table',
    }
  }
}
