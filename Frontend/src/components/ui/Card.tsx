import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-slate-200/80 shadow-subtle',
    elevated: 'bg-white border border-slate-100 shadow-card hover:shadow-cardHover transition-shadow duration-200',
    bordered: 'bg-white border-2 border-slate-200',
    dark: 'bg-slate-900 border border-slate-800 text-white shadow-xl',
  };

  return (
    <div className={`rounded-2xl p-6 ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
