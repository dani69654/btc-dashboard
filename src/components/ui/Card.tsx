import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-sm border border-hairline bg-surface p-3.5 ${className}`}>
      {children}
    </div>
  );
}
