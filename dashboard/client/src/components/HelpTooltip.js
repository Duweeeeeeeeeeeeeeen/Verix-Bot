import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Contextual help tooltip for forms.
 * @param {string} text - Documentation text
 * @param {string} size - Icon size
 */
export default function HelpTooltip({ text, size = 16, style = {} }) {
  if (!text) return null;

  return (
    <span 
      className="help-icon" 
      title={text}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        verticalAlign: 'middle', 
        marginLeft: '6px',
        ...style 
      }}
    >
      <HelpCircle size={size} />
      <style jsx>{`
        .help-icon {
          cursor: help;
        }
      `}</style>
    </span>
  );
}
