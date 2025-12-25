import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { DashboardPage } from '../pages/dashboard';
import { TransactionsPage } from '../pages/transactions';
import { InstallmentsPage } from '../pages/installments';
import { AppLayout } from './layouts/AppLayout';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionsPage,
});

const installmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/installments',
  component: InstallmentsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  transactionsRoute,
  installmentsRoute,
]);

export const router = createRouter({ routeTree });