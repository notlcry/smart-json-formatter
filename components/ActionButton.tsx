import React from 'react';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'magic';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  variant = 'secondary',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20",
    secondary: "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    magic: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 shadow-violet-500/20"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className} flex-col !px-1 !py-2 gap-0.5 h-auto`}
      title={label}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="w-4 h-4">{icon}</span>
      )}
      <span className="text-[10px] leading-none text-center scale-90">{label}</span>
    </button>
  );
};