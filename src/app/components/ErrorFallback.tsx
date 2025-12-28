import { Container, Title, Text, Button, Paper, Stack, Alert } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const isDevelopment = import.meta.env.DEV;

  const handleReset = () => {
    // Clear any potentially corrupted data
    try {
      // Clear localStorage if it might be corrupted
      const keys = Object.keys(localStorage);
      const moneyTrackerKeys = keys.filter(key => 
        key.startsWith('money-tracker-') || 
        key.startsWith('financial-')
      );
      
      if (moneyTrackerKeys.length > 0) {
        const shouldClear = window.confirm(
          'This error might be caused by corrupted data. Would you like to clear your saved data and start fresh?'
        );
        
        if (shouldClear) {
          moneyTrackerKeys.forEach(key => localStorage.removeItem(key));
        }
      }
      
      resetErrorBoundary();
    } catch (resetError) {
      // If reset fails, reload the page
      window.location.reload();
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" shadow="sm">
        <Stack align="center" gap="md">
          <IconAlertTriangle size={48} color="var(--mantine-color-red-6)" />
          
          <Title order={2} ta="center">
            Application Error
          </Title>
          
          <Text ta="center" c="dimmed">
            The Money Tracker application encountered an unexpected error. 
            This might be due to corrupted data or a temporary issue.
          </Text>

          {isDevelopment && error && (
            <Alert 
              color="red" 
              title="Development Error Details"
              icon={<IconAlertTriangle size="1rem" />}
              style={{ width: '100%' }}
            >
              <Text size="sm" ff="monospace">
                {error.message}
              </Text>
              {error.stack && (
                <Text size="xs" ff="monospace" mt="xs" style={{ whiteSpace: 'pre-wrap' }}>
                  {error.stack}
                </Text>
              )}
            </Alert>
          )}

          <Button
            leftSection={<IconRefresh size="1rem" />}
            onClick={handleReset}
            size="md"
          >
            Reset Application
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}