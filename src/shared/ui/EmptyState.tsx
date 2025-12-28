import { Stack, Text, Title, Button, Paper, Center } from '@mantine/core';
import { IconInbox, IconPlus } from '@tabler/icons-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  icon,
  actionLabel,
  onAction,
  size = 'md',
}: EmptyStateProps) {
  const iconSize = size === 'sm' ? 48 : size === 'md' ? 64 : 80;
  const titleOrder = size === 'sm' ? 4 : size === 'md' ? 3 : 2;

  return (
    <Paper p="xl" radius="md" withBorder>
      <Center>
        <Stack align="center" gap="md" maw={400}>
          {icon || <IconInbox size={iconSize} color="var(--mantine-color-gray-5)" />}
          
          <Stack align="center" gap="xs">
            <Title order={titleOrder} c="dimmed" ta="center">
              {title}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              {description}
            </Text>
          </Stack>

          {actionLabel && onAction && (
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={onAction}
              mt="sm"
            >
              {actionLabel}
            </Button>
          )}
        </Stack>
      </Center>
    </Paper>
  );
}