import { ChevronDown } from "lucide-react";

/**
 * Reusable dark-themed select component
 * Matches the Scatter plot dropdown styling
 */
export default function UiSelect({ 
  options, 
  value, 
  onChange, 
  label,
  className = "",
  ...rest 
}) {
  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '500',
          color: '#6B7280',
          marginBottom: '4px'
        }}>
          {label}
        </label>
      )}
      <select
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: '40px',
          width: '100%',
          borderRadius: '12px',
          paddingRight: '40px',
          paddingLeft: '12px',
          appearance: 'none',
          outline: 'none',
          backgroundColor: '#171717',
          color: 'white',
          border: '1px solid #404040',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'inherit'
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '16px',
          width: '16px',
          color: '#D1D5DB'
        }}
      />
    </div>
  );
}
