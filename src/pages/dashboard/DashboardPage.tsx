import { 
  Container, 
  Title, 
  Grid, 
  Paper, 
  Text, 
  Group, 
  Stack,
  Badge,
  ThemeIcon,
  rem,
  useMantineTheme
} from '@mantine/core';
import { 
  IconWallet, 
  IconTrendingUp, 
  IconCreditCard, 
  IconCalendarDue,
  IconArrowUpRight,
  IconArrowDownRight
} from '@tabler/icons-react';
import { EmptyState } from '../../shared/ui';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  color?: string;
}

function MetricCard({ title, value, icon, trend, color = 'blue' }: MetricCardProps) {
  const theme = useMantineTheme();
  
  return (
    <Paper p="md" shadow="sm" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing: rem(0.5) }}>
          {title}
        </Text>
        <ThemeIcon size="lg" variant="light" color={color} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
      
      <Text size="xl" fw={700} mb="xs">
        {value}
      </Text>
      
      {trend && (
        <Group gap="xs">
          <Group gap={4}>
            {trend.positive ? (
              <IconArrowUpRight size="1rem" color={theme.colors.green[6]} />
            ) : (
              <IconArrowDownRight size="1rem" color={theme.colors.red[6]} />
            )}
            <Text size="sm" c={trend.positive ? 'green' : 'red'} fw={500}>
              {trend.value}%
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {trend.label}
          </Text>
        </Group>
      )}
    </Paper>
  );
}

export function DashboardPage() {
  // Mock data - will be replaced with real data from stores
  const metrics = [
    {
      title: 'Current Balance',
      value: '$2,450.00',
      icon: <IconWallet size="1.4rem" />,
      color: 'blue',
      trend: { value: 12, label: 'vs last month', positive: true }
    },
    {
      title: 'Total Spending',
      value: '$1,230.50',
      icon: <IconCreditCard size="1.4rem" />,
      color: 'red',
      trend: { value: 8, label: 'vs last month', positive: false }
    },
    {
      title: 'Available for Investment',
      value: '$850.00',
      icon: <IconTrendingUp size="1.4rem" />,
      color: 'green',
      trend: { value: 15, label: 'vs last month', positive: true }
    },
    {
      title: 'Upcoming Payments',
      value: '$420.00',
      icon: <IconCalendarDue size="1.4rem" />,
      color: 'orange'
    }
  ];

  return (
    <Container size="xl" className="container-responsive">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={1} size="h1" mb="xs">
              Financial Dashboard
            </Title>
            <Text c="dimmed" size="lg">
              Overview of your financial health and activity
            </Text>
          </div>
          <Badge size="lg" variant="light" color="green">
            Healthy
          </Badge>
        </Group>

        {/* Metrics Grid */}
        <Grid>
          {metrics.map((metric, index) => (
            <Grid.Col key={index} span={{ base: 12, xs: 6, md: 3 }}>
              <MetricCard {...metric} />
            </Grid.Col>
          ))}
        </Grid>

        {/* Recent Activity Section */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper p="md" shadow="sm" radius="md" withBorder h="400">
              <Title order={3} mb="md">
                Recent Transactions
              </Title>
              <EmptyState
                title="No transactions yet"
                description="Start by adding your first credit card transaction to track your spending."
                actionLabel="Add Transaction"
                onAction={() => console.log('Navigate to transactions')}
                size="sm"
              />
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" shadow="sm" radius="md" withBorder h="400">
              <Title order={3} mb="md">
                Upcoming Payments
              </Title>
              <EmptyState
                title="No upcoming payments"
                description="Your payment calendar is clear for the next 30 days."
                size="sm"
              />
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Investment Recommendations */}
        <Paper p="md" shadow="sm" radius="md" withBorder>
          <Title order={3} mb="md">
            Investment Recommendations
          </Title>
          <EmptyState
            title="Investment analysis pending"
            description="Add your current balance and upcoming obligations to receive personalized investment recommendations."
            size="sm"
          />
        </Paper>
      </Stack>
    </Container>
  );
}