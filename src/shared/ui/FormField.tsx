import { TextInput, Textarea, NumberInput } from '@mantine/core';
import { forwardRef } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  type?: 'text' | 'textarea' | 'number' | 'email';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    error, 
    required, 
    description, 
    type = 'text', 
    placeholder,
    value,
    onChange,
    disabled,
    leftSection,
    rightSection,
    min,
    max,
    step,
    rows = 3,
    ...props 
  }, ref) => {
    const commonProps = {
      label,
      error,
      required,
      description,
      placeholder,
      disabled,
      leftSection,
      rightSection,
      ...props,
    };

    if (type === 'number') {
      return (
        <NumberInput
          {...commonProps}
          value={value as number}
          onChange={(val) => onChange?.(val || 0)}
          min={min}
          max={max}
          step={step}
          hideControls={false}
          allowNegative={false}
          allowDecimal={true}
          decimalScale={2}
          fixedDecimalScale={true}
        />
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          {...commonProps}
          value={value as string}
          onChange={(event) => onChange?.(event.currentTarget.value)}
          rows={rows}
          autosize
          minRows={rows}
          maxRows={6}
        />
      );
    }

    return (
      <TextInput
        {...commonProps}
        ref={ref}
        type={type}
        value={value as string}
        onChange={(event) => onChange?.(event.currentTarget.value)}
      />
    );
  }
);

FormField.displayName = 'FormField';