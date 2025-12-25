# Money Tracker

A comprehensive personal finance tracking application built with React, TypeScript, and modern web technologies. Track credit card transactions, manage installment payments, monitor upcoming obligations, and get investment recommendations.

## Features

- **Transaction Management**: Record and track credit card transactions with categorization
- **Installment Planning**: Create and manage installment payment plans with automatic calculations
- **Payment Tracking**: Monitor upcoming payment obligations with visual warnings
- **Investment Recommendations**: Get suggestions for investing surplus funds
- **Financial Dashboard**: Comprehensive overview of your financial health
- **Data Persistence**: Local storage with backup and export capabilities

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Mantine UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Routing**: TanStack Router
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library + fast-check (Property-Based Testing)
- **Architecture**: Feature Slice Design (FSD)

## Architecture

This project follows Feature Slice Design (FSD) methodology with the following structure:

```
src/
├── app/           # Application initialization, providers, routing
├── pages/         # Application pages/screens
├── widgets/       # Complex UI components combining features
├── features/      # Business logic features
├── entities/      # Business entities and models
└── shared/        # Reusable utilities, UI components, constants
```

## Prerequisites

- Node.js (version 18 or higher)
- Yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd money-tracker
```

2. Install dependencies:
```bash
yarn install
```

## Development

Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run tests once
- `yarn test:watch` - Run tests in watch mode
- `yarn test:ui` - Run tests with UI interface
- `yarn lint` - Run ESLint

## Testing

The project uses a dual testing approach:

### Unit Tests
- Component testing with React Testing Library
- Function testing for calculations and utilities
- Integration testing for store operations

### Property-Based Tests
- Uses fast-check library for property-based testing
- Tests universal properties across all inputs
- Validates correctness properties from the design specification

Run tests:
```bash
# Run all tests once
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with UI
yarn test:ui
```

## Project Structure

### Key Directories

- **`src/app/`** - Application setup, routing, and global providers
- **`src/pages/`** - Page components (Dashboard, Transactions, Installments)
- **`src/entities/`** - Business entities (Transaction, InstallmentPlan, etc.)
- **`src/shared/`** - Shared utilities, types, and configurations
- **`src/features/`** - Feature-specific business logic
- **`src/widgets/`** - Complex UI components

### Data Models

The application uses TypeScript interfaces for type safety:

- **Transaction**: Credit card transaction records
- **InstallmentPlan**: Payment plan with scheduled payments
- **PaymentObligation**: Upcoming payment requirements
- **FinancialState**: Overall financial status

## Features Implementation

### Transaction Management
- Add, edit, and delete credit card transactions
- Categorization and filtering
- Chronological ordering
- Data validation

### Installment Planning
- Create installment plans with automatic payment calculations
- Track remaining payments and due dates
- Payment completion workflow
- Visual payment calendar

### Payment Tracking
- Upcoming payment notifications
- Visual warnings for due dates
- Obligation aggregation
- Payment history

### Investment Recommendations
- Available balance calculations
- Investment opportunity suggestions
- Risk-based recommendations
- Integration with financial planning

## Data Persistence

The application uses local storage for data persistence:

- Automatic saving of all financial data
- Data validation and error recovery
- Export/import functionality
- Migration support for future schema changes

## Contributing

1. Follow the Feature Slice Design architecture
2. Write both unit tests and property-based tests for new features
3. Ensure all tests pass before submitting
4. Follow TypeScript best practices
5. Use Mantine UI components for consistency

## Performance

- TanStack Query for efficient data caching
- Memoization for expensive calculations
- Optimized component re-rendering
- Local storage optimization

## Browser Support

- Modern browsers with ES2020 support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

This project is licensed under the MIT License.