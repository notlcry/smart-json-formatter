import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { ActionButton } from './components/ActionButton';
import { JsonViewer } from './components/JsonViewer';
import { smartLocalParse, formatJson, minifyJson, generateDiff, DiffNode } from './services/jsonUtils';
import { fixJsonWithGemini } from './services/geminiService';
import {
  Wand2,
  FileJson,
  Minimize2,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Split
} from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(50); // Percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Diff Mode State
  const [mode, setMode] = useState<'format' | 'diff'>('format');
  const [diffOriginal, setDiffOriginal] = useState<string>('');
  const [diffModified, setDiffModified] = useState<string>('');
  const [diffResult, setDiffResult] = useState<DiffNode | null>(null);
  const [diffOutput, setDiffOutput] = useState<any>(null);

  // Resize handlers
  const startResizing = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const containerWidth = window.innerWidth - 80; // Approximate width minus sidebar/padding
      // This is a rough estimate, a ref would be better but this is simpler for now
      // Let's use percentage of window width for simplicity
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 10 && newWidth < 90) {
        setLeftPanelWidth(newWidth);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Clear temporary messages
  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleFormat = useCallback(() => {
    clearMessages();
    if (!input.trim()) return;

    const result = smartLocalParse(input);
    if (result.success) {
      setOutput(formatJson(result.data));
      setSuccessMsg('Formatted successfully (Local)');
    } else {
      // Don't set output to empty, allow user to see previous
      setError(result.error || 'Invalid JSON');
    }
  }, [input]);

  const handleMinify = useCallback(() => {
    clearMessages();
    if (!input.trim()) return;

    const result = smartLocalParse(input);
    if (result.success) {
      setOutput(minifyJson(result.data));
      setSuccessMsg('Minified successfully');
    } else {
      setError(result.error || 'Invalid JSON');
    }
  }, [input]);

  const handleAiFix = useCallback(async () => {
    clearMessages();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      // First try local smart parse
      const localResult = smartLocalParse(input);
      if (localResult.success) {
        setOutput(formatJson(localResult.data));
        setSuccessMsg('Fixed using smart local logic');
        setIsProcessing(false);
        return;
      }

      // Fallback to Gemini
      const fixedJsonString = await fixJsonWithGemini(input);
      // Verify validity
      const verify = JSON.parse(fixedJsonString);
      setOutput(JSON.stringify(verify, null, 2));
      setSuccessMsg('Fixed with AI Magic');
    } catch (err) {
      setError('AI failed to fix the JSON. Please check the input.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setSuccessMsg('Copied to clipboard');
    setTimeout(() => setSuccessMsg(null), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    clearMessages();
  }, []);

  // Auto-format effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }

      const result = smartLocalParse(input);
      if (result.success) {
        // Only update if successful to avoid annoyance
        setOutput(formatJson(result.data));
        setError(null); // Clear error if it fixed itself
      }
      // If failed, do nothing (silent failure)
    }, 500);

    return () => clearTimeout(timer);
  }, [input]);

  // Handle Diff Generation
  useEffect(() => {
    if (mode === 'diff') {
      if (!diffOriginal.trim() || !diffModified.trim()) {
        setDiffResult(null);
        return;
      }

      const res1 = smartLocalParse(diffOriginal);
      const res2 = smartLocalParse(diffModified);

      if (res1.success && res2.success) {
        const diff = generateDiff(res1.data, res2.data);
        setDiffResult(diff);
        setDiffOutput(res2.data); // Show modified version with diff markers
        setError(null);
      } else {
        setDiffResult(null);
        // Optional: Set error if needed, but maybe silent is better while typing
      }
    }
  }, [diffOriginal, diffModified, mode]);

  return (
    <div className="min-h-screen lg:h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 overflow-auto lg:overflow-hidden">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex p-4 md:p-6 w-full gap-4 h-full">

          {/* Sidebar Controls */}
          <div className="flex-none w-14 bg-white p-1.5 rounded-xl border border-zinc-200 flex flex-col items-center gap-2 backdrop-blur-md z-20 shadow-xl h-full overflow-y-auto">
            <ActionButton
              label="Format"
              icon={<FileJson />}
              onClick={handleFormat}
              variant="primary"
              disabled={!input || mode === 'diff'}
            />
            <ActionButton
              label="Minify"
              icon={<Minimize2 />}
              onClick={handleMinify}
              disabled={!input || mode === 'diff'}
            />
            <ActionButton
              label="AI Fix"
              icon={<Wand2 />}
              onClick={handleAiFix}
              variant="magic"
              loading={isProcessing}
              disabled={!input || mode === 'diff'}
            />

            <div className="w-full h-px bg-zinc-200 my-2" />

            <ActionButton
              label={mode === 'format' ? "Diff Mode" : "Format Mode"}
              icon={<Split />}
              onClick={() => setMode(mode === 'format' ? 'diff' : 'format')}
              variant="secondary"
            />

            <div className="flex-1" /> {/* Spacer */}

            <ActionButton
              label="Copy"
              icon={<Copy />}
              onClick={handleCopy}
              disabled={!output}
            />
            <ActionButton
              label="Clear"
              icon={<Trash2 />}
              onClick={handleClear}
              variant="danger"
              disabled={!input && !output && !diffOriginal && !diffModified}
            />
          </div>

          {/* Editor Flex Container */}
          <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0 relative">

            {/* Input Area */}
            <div style={{ width: `${leftPanelWidth}% ` }} className="h-full flex flex-col pr-2 transition-none">
              {mode === 'format' ? (
                <CodeEditor
                  label="Input (JSON / Python / Escaped)"
                  value={input}
                  onChange={(val) => {
                    setInput(val);
                    clearMessages();
                  }}
                  placeholder="Paste your messy JSON here...
Examples:
1. Standard: {&quot;id&quot;: 1}
2. Python Dict: {'id': 1, 'active': True, 'meta': None}
3. Escaped: &quot;{\&quot;key\&quot;: \&quot;value\&quot;}&quot;"
                  error={error && !output ? "Parsing failed" : undefined}
                  className="h-full"
                />
              ) : (
                <div className="flex flex-col h-full gap-2">
                  <div className="flex-1">
                    <CodeEditor
                      label="Original JSON"
                      value={diffOriginal}
                      onChange={setDiffOriginal}
                      placeholder='{"id": 1, "name": "old"}'
                      className="h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <CodeEditor
                      label="Modified JSON"
                      value={diffModified}
                      onChange={setDiffModified}
                      placeholder='{"id": 1, "name": "new"}'
                      className="h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Resizer Handle */}
            <div
              className="w-4 flex items-center justify-center cursor-col-resize hover:bg-zinc-200 active:bg-blue-500/20 transition-colors z-10 -ml-2 -mr-2 select-none"
              onMouseDown={startResizing}
            >
              <div className="w-1 h-8 bg-zinc-300 rounded-full" />
            </div>

            {/* Output Area */}
            <div style={{ width: `${100 - leftPanelWidth}% ` }} className="h-full flex flex-col relative pl-2 transition-none">
              {/* Status Bar Overlay */}
              <div className="absolute top-0 right-0 z-10">
                {(successMsg || error) && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-bl-lg text-xs animate-fade-in shadow-lg
                    ${error ? 'bg-red-50 text-red-700 border-b border-l border-red-200' : 'bg-green-50 text-green-700 border-b border-l border-green-200'}`}>
                    {error ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{error || successMsg}</span>
                  </div>
                )}
              </div>

              {mode === 'diff' ? (
                diffResult ? (
                  diffResult.type === 'unchanged' ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                      <span className="font-medium text-zinc-600">The two JSONs are identical</span>
                    </div>
                  ) : (
                    <JsonViewer data={diffOutput} diff={diffResult} label="Diff Result" />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                    Enter two valid JSON objects to see the difference.
                  </div>
                )
              ) : (
                (() => {
                  // Try to parse output as JSON for the viewer
                  let jsonData = null;
                  let isValidJson = false;
                  try {
                    if (output) {
                      jsonData = JSON.parse(output);
                      isValidJson = true;
                    }
                  } catch (e) {
                    // Not valid JSON, just show text
                  }

                  if (isValidJson && jsonData !== null) {
                    return <JsonViewer data={jsonData} label="Output (Interactive)" />;
                  } else {
                    return (
                      <CodeEditor
                        label="Output (Text)"
                        value={output}
                        readOnly
                        placeholder="Formatted result will appear here..."
                        className="h-full"
                      />
                    );
                  }
                })()
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;