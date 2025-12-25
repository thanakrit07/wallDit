import { AppShell, Text, NavLink, Group, Title } from '@mantine/core';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { IconDashboard, IconCreditCard, IconCalendarDue } from '@tabler/icons-react';

export function AppLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: IconDashboard },
    { path: '/transactions', label: 'Transactions', icon: IconCreditCard },
    { path: '/installments', label: 'Installments', icon: IconCalendarDue },
  ];

  return (
    <AppShell
      navbar={{
        width: 250,
        breakpoint: 'sm',
      }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Title order={3}>Money Tracker</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Text size="sm" fw={500} mb="md" c="dimmed">
          Navigation
        </Text>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            component={Link}
            to={item.path}
            label={item.label}
            leftSection={<item.icon size="1rem" />}
            active={location.pathname === item.path}
            mb="xs"
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}