import { NumberInput, type NumberInputProps } from '@mantine/core';
import { IconCurrencyDollar } from '@tabler/icons-react';
import { forwardRef } from 'react';

interface CurrencyInputProps extends Omit<NumberInputProps, 'leftSection' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currency = 'USD', ...props }, ref) => {
    // const formatCurrency = (val: number | string) => {
    //   const numVal = typeof val === 'string' ? parseFloat(val) : val;
    //   if (isNaN(numVal)) return '';
      
    //   return new Intl.NumberFormat('en-US', {
    //     style: 'currency',
    //     currency,
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2,
    //   }).format(numVal);
    // };

    return (
      <NumberInput
        {...props}
        ref={ref}
        value={value}
        onChange={(val) => onChange?.(Number(val) || 0)}
        leftSection={<IconCurrencyDollar size="1rem" />}
        hideControls={false}
        allowNegative={false}
        allowDecimal={true}
        decimalScale={2}
        fixedDecimalScale={true}
        min={0}
        step={0.01}
        placeholder="0.00"
        thousandSeparator=","
        styles={{
          input: {
            textAlign: 'right',
          },
        }}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';