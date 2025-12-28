import { Container, Title, Text, Button, Paper, Stack } from '@mantine/core';
import { IconHome, IconArrowLeft } from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';

export function NotFoundPage() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: '/' });
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" shadow="sm">
        <Stack align="center" gap="md">
          <Title order={1} size="4rem" c="dimmed">
            404
          </Title>
          
          <Title order={2} ta="center">
            Page Not Found
          </Title>
          
          <Text ta="center" c="dimmed" size="lg">
            The page you're looking for doesn't exist or has been moved.
          </Text>

          <Stack gap="sm" mt="md">
            <Button
              component={Link}
              to="/"
              leftSection={<IconHome size="1rem" />}
              size="md"
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="light"
              leftSection={<IconArrowLeft size="1rem" />}
              onClick={handleGoBack}
              size="md"
            >
              Go Back
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}