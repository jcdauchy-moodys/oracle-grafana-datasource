/**
 * Oracle SQL language definition for Monaco Editor
 * Based on PostgreSQL language definitions and extended for Oracle-specific syntax
 */

export const oracleSqlLanguageDef = {
  defaultToken: '',
  tokenPostfix: '.sql',
  ignoreCase: true,

  brackets: [
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
  ],

  keywords: [
    // Oracle-specific keywords
    'ABORT', 'ACCESS', 'ADD', 'ADMIN', 'AFTER', 'AGGREGATE', 'ALL', 'ALLOCATE', 'ALTER', 
    'ANALYZE', 'AND', 'ANY', 'ARCHIVE', 'ARCHIVELOG', 'ARRAY', 'AS', 'ASC', 'ASSOCIATE',
    'AT', 'AUDIT', 'AUTHID', 'AUTHORIZATION', 'AUTONOMOUS_TRANSACTION', 'BACKUP', 'BECOME',
    'BEFORE', 'BEGIN', 'BETWEEN', 'BFILE', 'BITMAP', 'BLOB', 'BLOCK', 'BODY', 'BOOLEAN',
    'BOTH', 'BREADTH', 'BULK', 'BY', 'BYTE', 'CACHE', 'CALL', 'CANCEL', 'CASCADE', 'CASE',
    'CAST', 'CHANGE', 'CHAR', 'CHARACTER', 'CHECK', 'CHECKPOINT', 'CLOSE', 'CLUSTER', 
    'COALESCE', 'COLLATE', 'COLLECT', 'COLUMN', 'COMMENT', 'COMMIT', 'COMMITTED', 'COMPILE',
    'COMPRESS', 'CONNECT', 'CONSTRAINT', 'CONSTRAINTS', 'CONSTRUCTOR', 'CONTEXT', 'CONTINUE',
    'CONVERT', 'COUNT', 'CREATE', 'CROSS', 'CUBE', 'CURRENT', 'CURRENT_DATE', 'CURRENT_TIME',
    'CURRENT_TIMESTAMP', 'CURRENT_USER', 'CURSOR', 'CYCLE', 'DATA', 'DATABASE', 'DATE',
    'DAY', 'DEALLOCATE', 'DEC', 'DECIMAL', 'DECLARE', 'DEFAULT', 'DEFERRABLE', 'DEFERRED',
    'DELETE', 'DEPTH', 'DESC', 'DETERMINISTIC', 'DIRECTORY', 'DISABLE', 'DISCONNECT',
    'DISTINCT', 'DO', 'DOUBLE', 'DROP', 'DUMP', 'EACH', 'ELSE', 'ELSIF', 'ENABLE', 'END',
    'ESCAPE', 'EXCEPT', 'EXCEPTION', 'EXCEPTIONS', 'EXCLUSIVE', 'EXECUTE', 'EXISTS', 'EXIT',
    'EXPLAIN', 'EXTENT', 'EXTERNAL', 'EXTERNALLY', 'EXTRACT', 'FALSE', 'FETCH', 'FILE',
    'FIRST', 'FLOAT', 'FOR', 'FORALL', 'FORCE', 'FOREIGN', 'FOUND', 'FROM', 'FULL', 'FUNCTION',
    'GOTO', 'GRANT', 'GROUP', 'GROUPING', 'HAVING', 'HEAP', 'HOUR', 'IDENTIFIED', 'IF',
    'IMMEDIATE', 'IN', 'INCLUDING', 'INCREMENT', 'INDEX', 'INDICATOR', 'INITIAL', 'INITIALLY',
    'INITRANS', 'INLINE', 'INNER', 'INOUT', 'INSERT', 'INSTANCE', 'INT', 'INTEGER', 'INTERSECT',
    'INTERVAL', 'INTO', 'IS', 'ISOLATION', 'JOIN', 'KEY', 'LANGUAGE', 'LAST', 'LATERAL',
    'LEADING', 'LEFT', 'LEVEL', 'LIBRARY', 'LIKE', 'LIMIT', 'LOCAL', 'LOCK', 'LONG', 'LOOP',
    'MATCHED', 'MATERIALIZED', 'MAX', 'MAXEXTENTS', 'MAXTRANS', 'MEMBER', 'MERGE', 'MIN',
    'MINUS', 'MINUTE', 'MLSLABEL', 'MODE', 'MODIFY', 'MONTH', 'MULTISET', 'NATIONAL', 'NATURAL',
    'NCHAR', 'NEW', 'NEXT', 'NO', 'NOARCHIVELOG', 'NOAUDIT', 'NOCACHE', 'NOCOMPRESS', 'NOCYCLE',
    'NOMAXVALUE', 'NOMINVALUE', 'NONE', 'NOORDER', 'NOPARALLEL', 'NOREVERSE', 'NORMAL',
    'NOT', 'NOTFOUND', 'NOWAIT', 'NULL', 'NULLIF', 'NUMBER', 'NUMERIC', 'NVARCHAR', 'NVARCHAR2',
    'OBJECT', 'OF', 'OFF', 'OFFLINE', 'OFFSET', 'OLD', 'ON', 'ONLINE', 'ONLY', 'OPEN', 'OPTION',
    'OR', 'ORDER', 'ORGANIZATION', 'OTHERS', 'OUT', 'OUTER', 'OVER', 'OVERFLOW', 'OVERRIDING',
    'PACKAGE', 'PARALLEL', 'PARAMETER', 'PARTITION', 'PASSING', 'PASSWORD', 'PCTFREE', 'PCTUSED',
    'PERCENT_RANK', 'PIPELINED', 'PLAN', 'PRECISION', 'PRESERVE', 'PRIMARY', 'PRIOR', 'PRIVATE',
    'PRIVILEGES', 'PROCEDURE', 'PROFILE', 'PUBLIC', 'PURGE', 'QUERY', 'QUOTA', 'RANGE', 'RAW',
    'READ', 'REAL', 'RECORD', 'RECOVER', 'REENABLE', 'REF', 'REFERENCES', 'REFERENCING', 
    'REFRESH', 'RELEASE', 'RENAME', 'REPLACE', 'RESTRICT', 'RESULT', 'RETURN', 'RETURNING',
    'RETURNS', 'REUSE', 'REVERSE', 'REVOKE', 'RIGHT', 'ROLE', 'ROLLBACK', 'ROLLUP', 'ROW',
    'ROWID', 'ROWNUM', 'ROWS', 'ROWTYPE', 'SAMPLE', 'SAVEPOINT', 'SCHEMA', 'SCN', 'SECOND',
    'SECTION', 'SEGMENT', 'SELECT', 'SEQUENCE', 'SERIALIZABLE', 'SESSION', 'SET', 'SETS',
    'SHARE', 'SHOW', 'SHUTDOWN', 'SIZE', 'SMALLINT', 'SNAPSHOT', 'SOME', 'SPACE', 'SQL',
    'SQLERROR', 'SQLEXCEPTION', 'SQLSTATE', 'SQLWARNING', 'START', 'STATEMENT', 'STATIC',
    'STORAGE', 'SUBPARTITION', 'SUBTYPE', 'SUCCESSFUL', 'SYNONYM', 'SYSDATE', 'SYSTEM',
    'TABLE', 'TABLESPACE', 'TEMPORARY', 'THEN', 'TIME', 'TIMESTAMP', 'TIMEZONE_ABBR',
    'TIMEZONE_HOUR', 'TIMEZONE_MINUTE', 'TIMEZONE_REGION', 'TO', 'TRAILING', 'TRANSACTION',
    'TRIGGER', 'TRUE', 'TRUNCATE', 'TYPE', 'UNDER', 'UNION', 'UNIQUE', 'UNLIMITED', 'UNLOCK',
    'UNSIGNED', 'UNTIL', 'UPDATE', 'USAGE', 'USE', 'USER', 'USING', 'VALIDATE', 'VALUE',
    'VALUES', 'VARCHAR', 'VARCHAR2', 'VARIABLE', 'VARRAY', 'VARYING', 'VIEW', 'VIEWS',
    'WAIT', 'WHEN', 'WHENEVER', 'WHERE', 'WHILE', 'WITH', 'WORK', 'WRITE', 'YEAR', 'ZONE',
  ],

  operators: [
    'AND', 'BETWEEN', 'IN', 'LIKE', 'NOT', 'OR', 'IS', 'NULL', 'INTERSECT', 'UNION', 'INNER',
    'JOIN', 'LEFT', 'OUTER', 'RIGHT',
  ],

  builtinFunctions: [
    // Oracle built-in functions
    'ABS', 'ACOS', 'ADD_MONTHS', 'ASCII', 'ASCIISTR', 'ASIN', 'ATAN', 'ATAN2', 'AVG',
    'BFILENAME', 'BIN_TO_NUM', 'BITAND', 'CAST', 'CEIL', 'CHARTOROWID', 'CHR', 'COALESCE',
    'CONCAT', 'CONVERT', 'COS', 'COSH', 'COUNT', 'CURRENT_DATE', 'CURRENT_TIMESTAMP',
    'DBTIMEZONE', 'DECODE', 'DENSE_RANK', 'DEREF', 'DUMP', 'EMPTY_BLOB', 'EMPTY_CLOB',
    'EXP', 'EXTRACT', 'FIRST', 'FIRST_VALUE', 'FLOOR', 'FROM_TZ', 'GREATEST', 'HEXTORAW',
    'INITCAP', 'INSTR', 'LAG', 'LAST', 'LAST_DAY', 'LAST_VALUE', 'LEAD', 'LEAST', 'LENGTH',
    'LISTAGG', 'LN', 'LOCALTIMESTAMP', 'LOG', 'LOWER', 'LPAD', 'LTRIM', 'MAX', 'MEDIAN', 'MIN',
    'MOD', 'MONTHS_BETWEEN', 'NANVL', 'NCHR', 'NEW_TIME', 'NEXT_DAY', 'NTH_VALUE', 'NULLIF',
    'NUMTODSINTERVAL', 'NUMTOYMINTERVAL', 'NVL', 'NVL2', 'POWER', 'RANK', 'RATIO_TO_REPORT',
    'RAWTOHEX', 'REGEXP_COUNT', 'REGEXP_INSTR', 'REGEXP_LIKE', 'REGEXP_REPLACE', 'REGEXP_SUBSTR',
    'REPLACE', 'ROUND', 'ROW_NUMBER', 'ROWIDTOCHAR', 'ROWIDTONCHAR', 'RPAD', 'RTRIM',
    'SESSIONTIMEZONE', 'SIGN', 'SIN', 'SINH', 'SOUNDEX', 'SQRT', 'STDDEV', 'SUBSTR', 'SUM',
    'SYS_CONNECT_BY_PATH', 'SYS_CONTEXT', 'SYS_EXTRACT_UTC', 'SYS_GUID', 'SYSDATE', 'SYSTIMESTAMP',
    'TAN', 'TANH', 'TO_BLOB', 'TO_CHAR', 'TO_CLOB', 'TO_DATE', 'TO_DSINTERVAL', 'TO_LOB',
    'TO_MULTI_BYTE', 'TO_NCHAR', 'TO_NCLOB', 'TO_NUMBER', 'TO_SINGLE_BYTE', 'TO_TIMESTAMP',
    'TO_TIMESTAMP_TZ', 'TO_YMINTERVAL', 'TRANSLATE', 'TRIM', 'TRUNC', 'TZ_OFFSET', 'UID',
    'UNISTR', 'UPPER', 'USER', 'USERENV', 'VALUE', 'VARIANCE', 'VSIZE',
  ],

  builtinVariables: [
    // Oracle system views and tables
    'V$SESSION', 'V$SQL', 'V$SQLAREA', 'V$PROCESS', 'V$INSTANCE', 'V$DATABASE', 'V$PARAMETER',
    'V$SYSTEM_PARAMETER', 'V$SYSSTAT', 'V$SESSTAT', 'V$STATNAME', 'V$SQL_PLAN', 'V$SQL_PLAN_STATISTICS',
    'V$ACTIVE_SESSION_HISTORY', 'DBA_TABLES', 'DBA_VIEWS', 'DBA_USERS', 'DBA_OBJECTS',
    'ALL_TABLES', 'ALL_VIEWS', 'ALL_OBJECTS', 'USER_TABLES', 'USER_VIEWS', 'USER_OBJECTS',
    'DUAL',
  ],

  pseudoColumns: ['ROWNUM', 'ROWID', 'LEVEL', 'CONNECT_BY_ROOT', 'CONNECT_BY_ISLEAF'],

  tokenizer: {
    root: [
      { include: '@comments' },
      { include: '@whitespace' },
      { include: '@pseudoColumns' },
      { include: '@numbers' },
      { include: '@strings' },
      { include: '@complexIdentifiers' },
      [/[;,.]/, 'delimiter'],
      [/[()]/, '@brackets'],
      [
        /[\w@#$]+/,
        {
          cases: {
            '@keywords': 'keyword',
            '@operators': 'operator',
            '@builtinVariables': 'predefined',
            '@builtinFunctions': 'predefined',
            '@default': 'identifier',
          },
        },
      ],
      [/[<>=!%&+\-*/|~^]/, 'operator'],
    ],
    whitespace: [
      [/\s+/, 'white']
    ],
    comments: [
      [/--+.*/, 'comment'],
      [/\/\*/, { token: 'comment.quote', next: '@comment' }],
    ],
    comment: [
      [/[^*/]+/, 'comment'],
      [/\*\//, { token: 'comment.quote', next: '@pop' }],
      [/./, 'comment'],
    ],
    pseudoColumns: [
      [
        /[$][A-Za-z_][\w$]*/,
        {
          cases: {
            '@pseudoColumns': 'predefined',
            '@default': 'identifier',
          },
        },
      ],
    ],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'number'],
      [/[$][+-]*\d*(\.\d*)?/, 'number'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, 'number'],
    ],
    strings: [
      [/N'/, { token: 'string', next: '@string' }],
      [/'/, { token: 'string', next: '@string' }],
    ],
    string: [
      [/[^']+/, 'string'],
      [/''/, 'string'],
      [/'/, { token: 'string', next: '@pop' }],
    ],
    complexIdentifiers: [
      [/"/, { token: 'identifier.quote', next: '@quotedIdentifier' }]
    ],
    quotedIdentifier: [
      [/[^"]+/, 'identifier'],
      [/""/, 'identifier'],
      [/"/, { token: 'identifier.quote', next: '@pop' }],
    ],
  },
};

/**
 * Oracle SQL language configuration for Monaco Editor
 */
export const oracleSqlLanguageConfig = {
  comments: {
    lineComment: '--',
    blockComment: ['/*', '*/'] as [string, string],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ] as Array<[string, string]>,
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

