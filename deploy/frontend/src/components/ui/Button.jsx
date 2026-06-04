import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({ children, className = '', to, ...props }) {
  const base = 'button inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium';
  const classes = `${base} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
