
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3a6.4 6.4 0 0 0-6.4 6.4 6.4 6.4 0 0 0 6.4 6.4 6.4 6.4 0 0 0 6.4-6.4A6.4 6.4 0 0 0 12 3z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
    <path d="M19 3l-3 3" />
    <path d="M5 17l3-3" />
    <path d="M3 19l3-3" />
    <path d="M17 5l-3 3" />
  </svg>
);
