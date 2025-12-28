import { Group, Button, type ButtonProps } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

interface FormActionsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  submitProps?: ButtonProps;
  cancelProps?: ButtonProps;
  resetProps?: ButtonProps;
  loading?: boolean;
  disabled?: boolean;
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  gap?: string | number;
}

export function FormActions({
  onSubmit,
  onCancel,
  onReset,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  resetLabel = 'Reset',
  submitProps,
  cancelProps,
  resetProps,
  loading = false,
  disabled = false,
  justify = 'flex-end',
  gap = 'md',
}: FormActionsProps) {
  return (
    <Group justify={justify} gap={gap} mt="xl">
      {onReset && (
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconX size="1rem" />}
          onClick={onReset}
          disabled={disabled || loading}
          {...resetProps}
        >
          {resetLabel}
        </Button>
      )}
      
      {onCancel && (
        <Button
          variant="light"
          color="gray"
          onClick={onCancel}
          disabled={loading}
          {...cancelProps}
        >
          {cancelLabel}
        </Button>
      )}
      
      {onSubmit && (
        <Button
          type="submit"
          leftSection={<IconCheck size="1rem" />}
          onClick={onSubmit}
          loading={loading}
          disabled={disabled}
          {...submitProps}
        >
          {submitLabel}
        </Button>
      )}
    </Group>
  );
}