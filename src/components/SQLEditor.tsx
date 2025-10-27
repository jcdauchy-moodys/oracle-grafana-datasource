import React, { useCallback, useEffect, useRef } from 'react';
import { CodeEditor, Monaco, monacoTypes } from '@grafana/ui';
import { oracleSqlLanguageDef, oracleSqlLanguageConfig } from '../language';
import { validateOracleQuery } from '../validation';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string | number;
  placeholder?: string;
  showMiniMap?: boolean;
  showLineNumbers?: boolean;
}

const LANGUAGE_ID = 'oracle-sql';

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  height = '200px',
  placeholder,
  showMiniMap = false,
  showLineNumbers = true,
}) => {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<monacoTypes.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  // Register Oracle SQL language
  const onEditorMount = useCallback((editor: monacoTypes.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    monacoRef.current = monaco;
    editorRef.current = editor;

    // Register the Oracle SQL language if not already registered
    const languages = monaco.languages.getLanguages();
    const isRegistered = languages.some((lang) => lang.id === LANGUAGE_ID);

    if (!isRegistered) {
      monaco.languages.register({ id: LANGUAGE_ID });
      monaco.languages.setLanguageConfiguration(LANGUAGE_ID, oracleSqlLanguageConfig);
      monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, oracleSqlLanguageDef);
    }

    // Set up validation
    if (!readOnly) {
      const model = editor.getModel();
      if (model) {
        // Validate on content change
        const validateAndMark = () => {
          const content = model.getValue();
          const errors = validateOracleQuery(content);

          // Clear previous decorations
          if (decorationsRef.current.length > 0) {
            decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
          }

          if (errors.length > 0) {
            // Add error decorations
            const newDecorations = errors.map((error) => ({
              range: new monaco.Range(
                error.startLineNumber,
                error.startColumn,
                error.endLineNumber,
                error.endColumn
              ),
              options: {
                isWholeLine: false,
                className: 'squiggly-error',
                hoverMessage: { value: error.message },
                glyphMarginClassName: 'glyph-error',
                inlineClassName: 'inline-error',
              },
            }));

            decorationsRef.current = editor.deltaDecorations([], newDecorations);
          }

          // Set markers for problems panel
          monaco.editor.setModelMarkers(
            model,
            LANGUAGE_ID,
            errors.map((error) => ({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: error.startLineNumber,
              startColumn: error.startColumn,
              endLineNumber: error.endLineNumber,
              endColumn: error.endColumn,
              message: error.message,
            }))
          );
        };

        // Initial validation
        validateAndMark();

        // Validate on change with debouncing
        let timeoutId: NodeJS.Timeout;
        model.onDidChangeContent(() => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(validateAndMark, 500);
        });
      }
    }

    // Focus the editor
    editor.focus();
  }, [readOnly]);

  const handleEditorChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div style={{ border: '1px solid rgba(204, 204, 220, 0.15)', borderRadius: '2px' }}>
      <CodeEditor
        value={value || ''}
        language={LANGUAGE_ID}
        height={height}
        onBlur={handleEditorChange}
        onSave={handleEditorChange}
        showMiniMap={showMiniMap}
        showLineNumbers={showLineNumbers}
        readOnly={readOnly}
        monacoOptions={{
          fontSize: 14,
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
          wordWrap: 'on',
          contextmenu: true,
          minimap: {
            enabled: showMiniMap,
          },
          lineNumbers: showLineNumbers ? 'on' : 'off',
          readOnly,
          quickSuggestions: !readOnly,
          suggest: {
            showKeywords: !readOnly,
            showSnippets: !readOnly,
            showFunctions: !readOnly,
          },
          tabSize: 2,
          insertSpaces: true,
          autoClosingBrackets: readOnly ? 'never' : 'always',
          autoClosingQuotes: readOnly ? 'never' : 'always',
          formatOnPaste: !readOnly,
          formatOnType: !readOnly,
          renderWhitespace: 'selection',
          hover: {
            enabled: true,
          },
          lightbulb: {
            enabled: !readOnly,
          },
        }}
        onEditorDidMount={onEditorMount}
      />
    </div>
  );
};

