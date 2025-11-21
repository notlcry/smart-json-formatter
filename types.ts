import { ReactNode } from 'react';

export interface FormatResult {
  success: boolean;
  data?: string;
  error?: string;
  source?: 'local' | 'ai';
}

export enum ViewMode {
  Split = 'SPLIT',
  Tabbed = 'TABBED'
}

export interface ToolbarAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
}
