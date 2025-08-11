import { ReactNode } from 'react';

interface TitleProps {
  children: ReactNode;
  className?: string;
}

export const Title = ({ children, className = '' }: TitleProps) => {
  return (
    <h1 className={`text-4xl font-bold text-center ${className}`}>
      {children}
    </h1>
  );
};