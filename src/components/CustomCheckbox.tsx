import React from 'react';
import { FiCheck } from 'react-icons/fi';

interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div className="custom-checkbox-group">
      <div
        className={`custom-checkbox ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && <FiCheck size={12} />}
      </div>
      <label
        htmlFor={id}
        className={`custom-checkbox-label ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        {label}
      </label>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ display: 'none' }}
      />
    </div>
  );
};