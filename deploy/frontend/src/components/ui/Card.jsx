import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`card-root ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`card-header p-4 ${className}`}>{children}</div>;
}

export function CardAction({ children, className = '' }) {
  return <div className={`card-action ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`card-title text-lg font-semibold px-4 py-2 ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`card-desc text-sm text-gray-700 px-4 py-1 ${className}`}>{children}</p>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`card-footer p-4 ${className}`}>{children}</div>;
}

export default Card;
