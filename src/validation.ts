/**
 * SQL Query validation utilities for Oracle SQL
 */

export interface QueryValidationError {
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

/**
 * Basic SQL query validation
 * Checks for common syntax errors and issues
 */
export function validateOracleQuery(query: string): QueryValidationError[] {
  const errors: QueryValidationError[] = [];
  
  if (!query || query.trim().length === 0) {
    return errors;
  }

  const lines = query.split('\n');
  
  // Check for unmatched parentheses
  let parenCount = 0;
  let parenLine = 0;
  let parenCol = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '(') {
        if (parenCount === 0) {
          parenLine = i + 1;
          parenCol = j + 1;
        }
        parenCount++;
      } else if (line[j] === ')') {
        parenCount--;
        if (parenCount < 0) {
          errors.push({
            message: 'Unmatched closing parenthesis',
            startLineNumber: i + 1,
            startColumn: j + 1,
            endLineNumber: i + 1,
            endColumn: j + 2,
          });
          parenCount = 0;
        }
      }
    }
  }
  
  if (parenCount > 0) {
    errors.push({
      message: 'Unmatched opening parenthesis',
      startLineNumber: parenLine,
      startColumn: parenCol,
      endLineNumber: parenLine,
      endColumn: parenCol + 1,
    });
  }

  // Check for unmatched quotes
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let quoteStartLine = 0;
  let quoteStartCol = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let j = 0;
    
    while (j < line.length) {
      // Skip comments
      if (!inSingleQuote && !inDoubleQuote) {
        if (line.substring(j, j + 2) === '--') {
          break; // Rest of line is comment
        }
        if (line.substring(j, j + 2) === '/*') {
          // Find end of block comment
          const endComment = query.indexOf('*/', query.split('\n').slice(0, i).join('\n').length + j);
          if (endComment === -1) {
            errors.push({
              message: 'Unclosed block comment',
              startLineNumber: i + 1,
              startColumn: j + 1,
              endLineNumber: i + 1,
              endColumn: j + 3,
            });
          }
        }
      }
      
      if (line[j] === "'" && !inDoubleQuote) {
        if (!inSingleQuote) {
          inSingleQuote = true;
          quoteStartLine = i + 1;
          quoteStartCol = j + 1;
        } else {
          // Check for escaped quote (two single quotes)
          if (j + 1 < line.length && line[j + 1] === "'") {
            j++; // Skip next quote
          } else {
            inSingleQuote = false;
          }
        }
      } else if (line[j] === '"' && !inSingleQuote) {
        if (!inDoubleQuote) {
          inDoubleQuote = true;
          quoteStartLine = i + 1;
          quoteStartCol = j + 1;
        } else {
          inDoubleQuote = false;
        }
      }
      
      j++;
    }
  }
  
  if (inSingleQuote) {
    errors.push({
      message: 'Unclosed single quote',
      startLineNumber: quoteStartLine,
      startColumn: quoteStartCol,
      endLineNumber: quoteStartLine,
      endColumn: quoteStartCol + 1,
    });
  }
  
  if (inDoubleQuote) {
    errors.push({
      message: 'Unclosed double quote',
      startLineNumber: quoteStartLine,
      startColumn: quoteStartCol,
      endLineNumber: quoteStartLine,
      endColumn: quoteStartCol + 1,
    });
  }

  // Check for common Oracle SQL mistakes
  const upperQuery = query.toUpperCase();
  
  // Check for SELECT without FROM (except SELECT from DUAL)
  const selectMatches = query.match(/\bSELECT\b/gi);
  const fromMatches = query.match(/\bFROM\b/gi);
  
  if (selectMatches && fromMatches) {
    if (selectMatches.length > fromMatches.length && !upperQuery.includes('FROM DUAL') && !upperQuery.includes('FROM SYS.DUAL')) {
      // This is a warning, not necessarily an error (could be a subquery issue)
      // We'll skip this check as it's too complex to validate properly
    }
  }

  // Check for semicolon in the middle of query (Oracle doesn't like multiple statements in one query typically)
  const semicolonMatches = [...query.matchAll(/;/g)];
  if (semicolonMatches.length > 1) {
    for (let i = 0; i < semicolonMatches.length - 1; i++) {
      const match = semicolonMatches[i];
      const index = match.index!;
      const beforeSemicolon = query.substring(0, index).trim();
      const afterSemicolon = query.substring(index + 1).trim();
      
      if (beforeSemicolon && afterSemicolon) {
        const lineNumber = query.substring(0, index).split('\n').length;
        const lastNewLine = query.substring(0, index).lastIndexOf('\n');
        const column = index - lastNewLine;
        
        errors.push({
          message: 'Multiple statements detected. Use separate queries for multiple statements.',
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column + 1,
        });
      }
    }
  }

  return errors;
}

/**
 * Check if a query appears to be a valid SQL statement
 */
export function isValidSQLStart(query: string): boolean {
  const trimmed = query.trim().toUpperCase();
  const validStarts = [
    'SELECT', 'WITH', 'INSERT', 'UPDATE', 'DELETE', 'MERGE',
    'CREATE', 'ALTER', 'DROP', 'TRUNCATE',
    'GRANT', 'REVOKE',
    'COMMIT', 'ROLLBACK', 'SAVEPOINT',
    'EXPLAIN', 'DESCRIBE', 'DESC',
    'SHOW', 'SET'
  ];
  
  return validStarts.some(start => trimmed.startsWith(start));
}

/**
 * Format SQL query errors for display
 */
export function formatValidationErrors(errors: QueryValidationError[]): string {
  if (errors.length === 0) {
    return '';
  }
  
  return errors.map(error => 
    `Line ${error.startLineNumber}, Column ${error.startColumn}: ${error.message}`
  ).join('\n');
}

