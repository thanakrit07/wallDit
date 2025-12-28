import { Select, type SelectProps } from '@mantine/core';
import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps extends Omit<SelectProps, 'data' | 'onChange'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
}

export const SelectInput = forwardRef<HTMLInputElement, SelectInputProps>(
  ({ options, value, onChange, placeholder = 'Select option', searchable = false, clearable = false, ...props }, ref) => {
    return (
      <Select
        {...props}
        ref={ref}
        data={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchable={searchable}
        clearable={clearable}
        comboboxProps={{ 
          withinPortal: false,
          shadow: 'md',
          transitionProps: { transition: 'pop', duration: 200 }
        }}
      />
    );
  }
);

SelectInput.displayName = 'SelectInput';