'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  labelClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  showPasswordToggle = false,
  leftIcon,
  labelClassName = '',
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className={`text-sm font-medium text-slate-300 ${labelClassName}`}>
        {label}
      </label>
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-4 text-slate-500 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          type={inputType}
          className={`w-full bg-slate-900 border-2 rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-all outline-none focus:ring-2 focus:ring-blue-500/50 
            ${error ? 'border-red-500 ring-red-500/20' : 'border-slate-800 focus:border-blue-500'} 
            ${leftIcon ? 'pl-11' : ''}
            ${className}`}
          {...props}
        />
        {showPasswordToggle && isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
