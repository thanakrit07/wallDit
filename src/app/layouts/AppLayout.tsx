import { 
  AppShell, 
  Text, 
  NavLink, 
  Group, 
  Title, 
  Burger, 
  ScrollArea,
  rem,
  useMantineTheme,
  Box
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { IconDashboard, IconCreditCard, IconCalendarDue, IconCurrencyDollar } from '@tabler/icons-react';

export function AppLayout() {
  const location = useLocation();
  const theme = useMantineTheme();
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: IconDashboard },
    { path: '/transactions', label: 'Transactions', icon: IconCreditCard },
    { path: '/installments', label: 'Installments', icon: IconCalendarDue },
  ];

  return (
    <AppShell
      navbar={{
        width: { base: 280, sm: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      header={{ height: { base: 60, sm: 70 } }}
      padding={{ base: 'sm', sm: 'md', lg: 'xl' }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {isMobile && (
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                hiddenFrom="sm"
              />
            )}
            <Group gap="xs">
              <IconCurrencyDollar size={rem(28)} color={theme.colors.blue[6]} />
              <Title order={3} size="h2">
                Money Tracker
              </Title>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppShell.Section grow component={ScrollArea} p="md">
          <Text size="sm" fw={500} mb="md" c="dimmed" tt="uppercase" style={{ letterSpacing: rem(1) }}>
            Navigation
          </Text>
          <Box>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                component={Link}
                to={item.path}
                label={item.label}
                leftSection={<item.icon size="1.2rem" />}
                active={location.pathname === item.path}
                onClick={close}
                mb="xs"
                styles={{
                  root: {
                    borderRadius: theme.radius.md,
                    fontWeight: 500,
                  },
                  label: {
                    fontSize: rem(14),
                  },
                }}
              />
            ))}
          </Box>
        </AppShell.Section>

        <AppShell.Section p="md">
          <Text size="xs" c="dimmed" ta="center">
            © 2024 Money Tracker
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box
          style={{
            minHeight: 'calc(100vh - var(--app-shell-header-height) - var(--app-shell-padding) * 2)',
          }}
        >
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}