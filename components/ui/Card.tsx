import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  subtle?: boolean;
  className?: string;
};

export function Card({ children, subtle = false, className = "" }: CardProps) {
  const base = subtle ? "card-subtle" : "card";
  return <div className={`${base} ${className}`.trim()}>{children}</div>;
}
