import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  label: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  label,
  placeholder,
  error,
  className = ''
}) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
        {readOnly && (
          <span className="text-xs text-zinc-500">{value.length} chars</span>
        )}
      </div>

      <div className={`relative flex-1 rounded-lg overflow-hidden border transition-colors duration-200 
        ${error ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-zinc-200 hover:border-zinc-300 focus-within:border-blue-500'}`}
      >
        <textarea
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className={`w-full h-full bg-white p-2 font-mono text-xs resize-none focus:outline-none
            ${readOnly ? 'text-emerald-600 cursor-text' : 'text-zinc-800 placeholder-zinc-400'}`}
        />

        {error && (
          <div className="absolute bottom-4 right-4 bg-red-900/90 text-red-200 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm border border-red-700/50 shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};