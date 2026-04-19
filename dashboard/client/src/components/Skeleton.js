import React from 'react';

/**
 * Skeleton component for loading states.
 * @param {string} width - CSS width
 * @param {string} height - CSS height
 * @param {string} variant - 'text', 'circle', or 'rect'
 * @param {object} style - Additional styles
 */
export default function Skeleton({ width, height, variant = 'text', style = {}, className = '' }) {
  const baseStyle = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100px'),
    display: 'inline-block',
    ...style
  };

  if (variant === 'circle') {
    baseStyle.borderRadius = '50%';
  }

  return (
    <div 
      className={`skeleton ${className}`} 
      style={baseStyle}
      aria-hidden="true"
    />
  );
}
