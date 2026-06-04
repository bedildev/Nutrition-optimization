import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const base = 'badge inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium';
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    secondary: 'bg-white/10 text-white',
  };

  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>;
}
