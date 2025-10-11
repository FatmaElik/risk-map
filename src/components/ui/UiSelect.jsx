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
    <div className="relative">
      {label && (
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
          {label}
        </label>
      )}
      <select
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          h-10 w-full rounded-xl pr-10 pl-3
          appearance-none outline-none
          bg-neutral-900 text-white
          border border-neutral-700
          shadow-sm
          focus:ring-2 focus:ring-neutral-400/60 focus:border-neutral-400/60
          disabled:opacity-60 disabled:cursor-not-allowed
          cursor:pointer
          ${className}
        `.trim()}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300"
      />
    </div>
  );
}
