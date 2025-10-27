import React, { FormEvent, useState } from 'react';
import { Label, TextArea, Select, InlineField, InlineFieldRow, Input, Collapse } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';

import { DataSource } from '../datasource';
import { interpolate } from '../interpolate';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const FORMAT_OPTIONS: Array<SelectableValue<string>> = [
  { label: 'Table', value: 'table' },
  { label: 'Time series', value: 'timeseries' }
];

export function QueryEditor({ onChange, query }: Props) {
  const [showConnectionOverrides, setShowConnectionOverrides] = useState(
    !!(query.o_override_hostname || query.o_override_port || query.o_override_service)
  );

  const onSQLChange = (event: FormEvent<HTMLTextAreaElement>) => {
    onChange({
      ...query,
      o_sql: event.currentTarget.value,
      o_parsed: interpolate(event.currentTarget.value ?? '')
    });
  }

  const onFormatChange = (item: SelectableValue<string>) => {
    onChange({
      ...query,
      format: item.value as 'table' | 'timeseries'
    });
  }

  const onOverrideHostnameChange = (event: FormEvent<HTMLInputElement>) => {
    onChange({
      ...query,
      o_override_hostname: event.currentTarget.value || undefined
    });
  }

  const onOverridePortChange = (event: FormEvent<HTMLInputElement>) => {
    const port = parseInt(event.currentTarget.value, 10);
    onChange({
      ...query,
      o_override_port: isNaN(port) ? undefined : port
    });
  }

  const onOverrideServiceChange = (event: FormEvent<HTMLInputElement>) => {
    onChange({
      ...query,
      o_override_service: event.currentTarget.value || undefined
    });
  }

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Format" labelWidth={20} tooltip="Format specifies how to interpret the result set">
          <Select 
            options={FORMAT_OPTIONS}
            value={query.format || 'table'}
            onChange={onFormatChange}
            width={20}
          />
        </InlineField>
      </InlineFieldRow>
      
      <Collapse
        label="Connection Overrides (Optional)"
        isOpen={showConnectionOverrides}
        onToggle={() => setShowConnectionOverrides(!showConnectionOverrides)}
        collapsible
      >
        <InlineFieldRow>
          <InlineField 
            label="Hostname" 
            labelWidth={20} 
            tooltip="Override the hostname from datasource settings. Uses datasource credentials."
          >
            <Input
              value={query.o_override_hostname || ''}
              onChange={onOverrideHostnameChange}
              placeholder="e.g., oracle-prod.example.com"
              width={40}
            />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField 
            label="Port" 
            labelWidth={20} 
            tooltip="Override the port from datasource settings"
          >
            <Input
              type="number"
              value={query.o_override_port || ''}
              onChange={onOverridePortChange}
              placeholder="e.g., 1521"
              width={20}
            />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField 
            label="Service Name" 
            labelWidth={20} 
            tooltip="Override the service name from datasource settings"
          >
            <Input
              value={query.o_override_service || ''}
              onChange={onOverrideServiceChange}
              placeholder="e.g., ORCL"
              width={40}
            />
          </InlineField>
        </InlineFieldRow>
      </Collapse>
      <div style={{
        alignItems: 'stretch',
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'stretch',
        minHeight: '320px'
      }}>
        <div style={{
          flexGrow: 1,
          minWidth: '480px',
          padding: '10px 5px'
        }}>
          <Label description='Query to make on an Oracle database'>
            Query
          </Label>
          <TextArea onChange={onSQLChange} placeholder='SELECT ash.* \n FROM v$active_session_history ash \nWHERE  ash.SAMPLE_TIME BETWEEN $__from AND $__to' rows={12} value={query.o_sql} required width='100%' />
        </div>
        <div style={{
          flexGrow: 1,
          minWidth: '480px',
          padding: '10px 5px'
        }}>
          <Label description='How the query will be executed on the database, using all the available variables'>
            Parsed Query
          </Label>
          <TextArea readOnly rows={12} value={interpolate(query.o_sql ?? '')} width='100%' />
        </div>
      </div>
    </div>
  );
}
