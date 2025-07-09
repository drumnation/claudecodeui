import React, {lazy, Suspense, memo} from 'react';
import type {Extension} from '@codemirror/state';
import type {EditorView as _EditorView} from '@codemirror/view';

// Lazy load CodeMirror and its extensions
const CodeMirror = lazy(() => import('@uiw/react-codemirror'));

// Lazy load language extensions
const loadLanguageExtension = (language: string): Promise<Extension> => {
  switch (language) {
    case 'javascript':
    case 'js':
      return import('@codemirror/lang-javascript').then((mod) =>
        mod.javascript(),
      );
    case 'typescript':
    case 'ts':
      return import('@codemirror/lang-javascript').then((mod) =>
        mod.javascript({typescript: true}),
      );
    case 'python':
      return import('@codemirror/lang-python').then((mod) => mod.python());
    case 'json':
      return import('@codemirror/lang-json').then((mod) => mod.json());
    case 'html':
      return import('@codemirror/lang-html').then((mod) => mod.html());
    case 'css':
      return import('@codemirror/lang-css').then((mod) => mod.css());
    case 'markdown':
      return import('@codemirror/lang-markdown').then((mod) => mod.markdown());
    default:
      return Promise.resolve([]);
  }
};

interface LazyCodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
}

const CodeEditorFallback = () => (
  <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-800 rounded-md">
    <div className="text-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Loading code editor...
      </p>
    </div>
  </div>
);

const LazyCodeEditor: React.FC<LazyCodeEditorProps> = memo(
  ({
    value,
    language = 'javascript',
    onChange,
    onFocus,
    onBlur,
    readOnly = false,
    className = '',
    placeholder = 'Enter code here...',
  }) => {
    const [extensions, setExtensions] = React.useState<Extension[]>([]);
    const [theme, setTheme] = React.useState<Extension | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      let mounted = true;

      const loadExtensions = async () => {
        try {
          const [langExtension, themeExtension] = await Promise.all([
            loadLanguageExtension(language),
            import('@codemirror/theme-one-dark').then((mod) => mod.oneDark),
          ]);

          if (mounted) {
            setExtensions([langExtension]);
            setTheme(themeExtension);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Failed to load CodeMirror extensions:', error);
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

      loadExtensions();

      return () => {
        mounted = false;
      };
    }, [language]);

    if (isLoading) {
      return <CodeEditorFallback />;
    }

    return (
      <Suspense fallback={<CodeEditorFallback />}>
        <CodeMirror
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          readOnly={readOnly}
          className={className}
          placeholder={placeholder}
          extensions={extensions}
          theme={theme || 'light'}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            searchKeymap: true,
          }}
        />
      </Suspense>
    );
  },
);

LazyCodeEditor.displayName = 'LazyCodeEditor';

export default LazyCodeEditor;
