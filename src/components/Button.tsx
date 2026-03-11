import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  const variants: any = {
    primary: "bg-zinc-50 text-zinc-950 hover:bg-zinc-200 shadow-sm",
    outline: "border border-zinc-800 bg-transparent hover:bg-zinc-900/50 text-zinc-50 backdrop-blur-sm",
    ghost: "hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-50 transition-colors",
    danger: "bg-red-900/10 text-red-500 hover:bg-red-900/20 border border-red-900/30 backdrop-blur-sm"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
