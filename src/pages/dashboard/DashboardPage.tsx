import { Container, Title, Grid, Paper, Text } from '@mantine/core';

export function DashboardPage() {
  return (
    <Container size="xl">
      <Title order={1} mb="xl">
        Financial Dashboard
      </Title>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Paper p="md" shadow="sm">
            <Text size="sm" c="dimmed" mb="xs">
              Current Balance
            </Text>
            <Text size="xl" fw={700}>
              $0.00
            </Text>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Paper p="md" shadow="sm">
            <Text size="sm" c="dimmed" mb="xs">
              Total Spending
            </Text>
            <Text size="xl" fw={700}>
              $0.00
            </Text>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Paper p="md" shadow="sm">
            <Text size="sm" c="dimmed" mb="xs">
              Available for Investment
            </Text>
            <Text size="xl" fw={700}>
              $0.00
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}