import { createRouter, createRoute, createRootRoute, ErrorComponent } from '@tanstack/react-router';
import { DashboardPage } from '../pages/dashboard';
import { TransactionsPage } from '../pages/transactions';
import { InstallmentsPage } from '../pages/installments';
import { AppLayout } from './layouts/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFoundPage } from './components/NotFoundPage';

// Root route with error boundary
const rootRoute = createRootRoute({
  component: AppLayout,
  errorComponent: ErrorBoundary,
  notFoundComponent: NotFoundPage,
});

// Dashboard route (index)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
  errorComponent: ErrorComponent,
});

// Transactions route
const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionsPage,
  errorComponent: ErrorComponent,
});

// Installments route
const installmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/installments',
  component: InstallmentsPage,
  errorComponent: ErrorComponent,
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  transactionsRoute,
  installmentsRoute,
]);

// Create router with configuration
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});