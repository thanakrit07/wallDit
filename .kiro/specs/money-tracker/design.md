# Design Document

## Overview

The Money Tracker System is a single-page React web application that provides comprehensive personal finance management. The system uses modern web technologies including React 18, Mantine UI for components, TanStack Query for data fetching, TanStack Router for navigation, and Zustand for state management. In the initial phase, the application will use local storage for data persistence, with architecture designed to easily integrate with a backend server in future phases.

## Architecture

The application follows a layered architecture pattern:

- **Presentation Layer**: React components using Mantine UI
- **State Management Layer**: Zustand stores for application state
- **Data Access Layer**: TanStack Query for data operations and caching
- **Storage Layer**: Local storage with JSON serialization
- **Routing Layer**: TanStack Router for client-side navigation
- **Validation Layer**: Validattion data using Valibot


The architecture emphasizes separation of concerns, making it easy to replace local storage with API calls when a backend becomes available.

## Components and Interfaces

### Core Components

1. **App Component**: Root component that sets up routing and global providers
2. **Dashboard Component**: Main page displaying all financial information
3. **TransactionForm Component**: Form for adding/editing credit card transactions
4. **InstallmentForm Component**: Form for creating/managing installment plans
5. **PaymentCalendar Component**: Visual display of upcoming payment obligations
6. **InvestmentPanel Component**: Shows available balance and investment recommendations
7. **FinancialSummary Component**: Overview cards showing key metrics

### Data Models

```typescript
interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO date string
  cardName: string;
  category?: string;
  createdAt: string;
}

interface InstallmentPlan {
  id: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
  startDate: string;
  duration: number; // months
  remainingPayments: number;
  nextDueDate: string;
  createdAt: string;
}

interface PaymentObligation {
  id: string;
  type: 'credit-card' | 'installment';
  amount: number;
  dueDate: string;
  description: string;
  isPaid: boolean;
}

interface FinancialState {
  currentBalance: number;
  totalSpending: number;
  upcomingObligations: number;
  availableForInvestment: number;
  lastUpdated: string;
}
```

### State Management Structure

```typescript
// Transaction Store
interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
}

// Installment Store
interface InstallmentStore {
  installmentPlans: InstallmentPlan[];
  addInstallmentPlan: (plan: Omit<InstallmentPlan, 'id' | 'createdAt'>) => void;
  updateInstallmentPlan: (id: string, updates: Partial<InstallmentPlan>) => void;
  markPaymentComplete: (planId: string) => void;
  getUpcomingPayments: (days: number) => PaymentObligation[];
}

// Financial Store
interface FinancialStore {
  currentBalance: number;
  setCurrentBalance: (balance: number) => void;
  calculateAvailableBalance: () => number;
  getInvestmentRecommendations: () => InvestmentRecommendation[];
}
```

## Data Models

The application uses TypeScript interfaces to ensure type safety across all data operations. The models are designed to be easily serializable to JSON for local storage and compatible with future REST API integration.

Key design decisions:
- All dates stored as ISO strings for consistency
- Unique IDs generated using crypto.randomUUID()
- Amounts stored as numbers (cents can be handled by multiplying by 100 if needed)
- Separate models for different types of financial data to maintain clarity
- Computed fields (like availableForInvestment) calculated dynamically rather than stored

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties about data persistence (1.4, 6.1, 6.2) can be combined into comprehensive round-trip properties
- Properties about calculation consistency (1.3, 2.5, 3.5, 4.4) can be unified into invariant properties
- Properties about date-based filtering (2.2, 3.1, 3.3) can be combined into comprehensive date filtering properties

### Core Properties

**Property 1: Transaction addition preserves data integrity**
*For any* valid transaction data, adding it to the system should result in the transaction appearing in the history with all original details preserved and the total spending updated correctly
**Validates: Requirements 1.1, 1.3**

**Property 2: Invalid transaction rejection**
*For any* transaction data missing required fields (amount, description, date, or card), the system should reject the addition and maintain the current state unchanged
**Validates: Requirements 1.2**

**Property 3: Transaction chronological ordering**
*For any* set of transactions with different dates, the system should always display them in chronological order regardless of the order they were added
**Validates: Requirements 1.5**

**Property 4: Data persistence round-trip**
*For any* financial data (transactions, installments, balance), saving and then loading the data should restore the exact same state
**Validates: Requirements 1.4, 6.1, 6.2**

**Property 5: Installment calculation correctness**
*For any* installment plan with valid parameters (total amount, monthly payment, start date, duration), the calculated payment dates should be exactly one month apart and the total of all payments should equal the original amount
**Validates: Requirements 2.1**

**Property 6: Payment completion state transitions**
*For any* installment plan, marking a payment as complete should decrease the remaining payments by one and advance the next due date by exactly one month
**Validates: Requirements 2.3**

**Property 7: Obligation aggregation consistency**
*For any* set of installment plans and credit card balances, the total upcoming obligations should equal the sum of all individual payment amounts due within the specified timeframe
**Validates: Requirements 2.4, 3.4**

**Property 8: Date-based payment filtering**
*For any* collection of payments with various due dates, filtering for payments due within N days should return only those payments whose due date is between today and N days from today
**Validates: Requirements 2.2, 3.1, 3.3**

**Property 9: Available balance calculation**
*For any* current balance and set of upcoming obligations, the available balance should always equal current balance minus total upcoming obligations
**Validates: Requirements 4.1**

**Property 10: Investment recommendation logic**
*For any* available balance above the minimum threshold, investment recommendations should be provided; for any available balance at or below zero, no investment recommendations should be made
**Validates: Requirements 4.2, 4.5**

**Property 11: State consistency across components**
*For any* data modification in the system, all components displaying related information should reflect the updated values immediately
**Validates: Requirements 5.3, 6.4**

**Property 12: Error handling for corrupted data**
*For any* corrupted or invalid data in local storage, the system should handle the error gracefully without crashing and provide recovery options
**Validates: Requirements 6.3**

**Property 13: Data export completeness**
*For any* financial state in the system, exporting the data should produce a backup that contains all transactions, installment plans, and current balance information
**Validates: Requirements 6.5**

## Error Handling

The application implements comprehensive error handling at multiple levels:

### Input Validation
- Form validation using Mantine's built-in validation with custom rules
- Type checking at runtime for critical financial calculations
- Date validation to prevent invalid or future dates where inappropriate
- Numeric validation for amounts (positive numbers, reasonable ranges)

### Data Persistence Errors
- Local storage quota exceeded: Graceful degradation with user notification
- Corrupted data detection: JSON parsing error handling with data recovery options
- Missing data: Default state initialization with user guidance

### Calculation Errors
- Division by zero protection in financial calculations
- Floating point precision handling for monetary amounts
- Overflow protection for large financial values

### UI Error Boundaries
- React Error Boundaries to catch component-level errors
- Fallback UI components for graceful degradation
- Error reporting to help users understand what went wrong

## Testing Strategy

The testing approach combines unit testing and property-based testing to ensure comprehensive coverage:

### Unit Testing
- Component testing using React Testing Library
- Individual function testing for calculations and utilities
- Integration testing for store operations
- Mock testing for local storage operations

### Property-Based Testing
- **Framework**: fast-check for JavaScript/TypeScript property-based testing
- **Configuration**: Minimum 100 iterations per property test
- **Coverage**: Each correctness property implemented as a separate property-based test
- **Annotation**: Each test tagged with format: '**Feature: money-tracker, Property {number}: {property_text}**'

**Property-based testing requirements**:
- Generate random financial data within realistic bounds
- Test edge cases like zero amounts, maximum values, and boundary dates
- Verify invariants hold across all generated inputs
- Ensure round-trip properties for data persistence
- Validate calculation correctness across wide input ranges

### Testing Implementation
- Unit tests verify specific examples and integration points
- Property tests verify universal correctness across all inputs
- Both approaches complement each other for comprehensive validation
- Tests focus on core functional logic and important edge cases
- Real functionality testing without mocks where possible

The dual testing approach ensures both concrete bug detection (unit tests) and general correctness verification (property tests), providing confidence in the system's reliability across all usage scenarios.