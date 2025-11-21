import React from 'react';
import { Braces } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-zinc-200 p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
          <Braces className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Smart JSON Formatter</h1>
          <p className="text-xs text-zinc-500">Supports Standard, Python Dict, & Escaped Strings</p>
        </div>
      </div>
    </header>
  );
};