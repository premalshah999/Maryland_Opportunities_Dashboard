import React from 'react';

export const UMDLogo = ({ className = "h-16 w-16" }: { className?: string }) => {
  return (
    <img 
      src="/umd-logo.png" 
      alt="University of Maryland Seal"
      className={className}
    />
  );
};