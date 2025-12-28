import { TextInput, type TextInputProps } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { forwardRef } from 'react';

interface CustomDateInputProps extends Omit<TextInputProps, 'onChange' | 'type' | 'value'> {
  value?: Date | string;
  onChange?: (value: string) => void;
  minDate?: string;
  maxDate?: string;
}

export const DateInput = forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ value, onChange, minDate, maxDate, ...props }, ref) => {
    // Convert Date to string if needed
    const stringValue = value ? (typeof value === 'string' ? value : value.toISOString().split('T')[0]) : '';

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.currentTarget.value);
    };

    return (
      <TextInput
        {...props}
        ref={ref}
        type="date"
        value={stringValue}
        onChange={handleChange}
        leftSection={<IconCalendar size="1rem" />}
        placeholder="Select date"
        min={minDate}
        max={maxDate}
      />
    );
  }
);

DateInput.displayName = 'DateInput';