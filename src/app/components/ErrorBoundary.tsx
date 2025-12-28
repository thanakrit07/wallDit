import { Container, Title, Text, Button, Paper, Stack, Alert } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import type { ErrorComponentProps } from '@tanstack/react-router';

export function ErrorBoundary({ error, reset }: ErrorComponentProps) {
  const isDevelopment = import.meta.env.DEV;

  const handleReset = () => {
    // Clear any corrupted data from localStorage if needed
    try {
      // You could add specific cleanup logic here
      reset();
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
            Something went wrong
          </Title>
          
          <Text ta="center" c="dimmed">
            An unexpected error occurred while loading this page. 
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
            Try Again
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}