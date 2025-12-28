import { 
  Container, 
  Title, 
  Paper, 
  Stack, 
  Group,
  Button,
  Text
} from '@mantine/core';
import { useState } from 'react';
import { IconPlus, IconCreditCard } from '@tabler/icons-react';
import { 
  FormField, 
  CurrencyInput, 
  DateInput, 
  SelectInput, 
  FormActions, 
  EmptyState 
} from '../../shared/ui';
import type { TransactionCategory } from '../../shared/types';

const categoryOptions = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];

interface TransactionFormData {
  amount: number;
  description: string;
  date: string;
  cardName: string;
  category: TransactionCategory | '';
}

function TransactionForm({ onSubmit, onCancel }: { 
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    cardName: '',
    category: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Card name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Paper p="xl" shadow="sm" radius="md" withBorder>
      <Stack gap="md">
        <Title order={3} mb="md">
          Add New Transaction
        </Title>

        <div className="form-row">
          <CurrencyInput
            label="Amount"
            required
            value={formData.amount}
            onChange={(value) => updateField('amount', value)}
            error={errors.amount}
            placeholder="0.00"
          />
          
          <DateInput
            label="Date"
            required
            value={formData.date}
            onChange={(value) => updateField('date', value)}
            error={errors.date}
            maxDate={new Date().toISOString().split('T')[0]}
          />
        </div>

        <FormField
          label="Description"
          required
          value={formData.description}
          onChange={(value) => updateField('description', value)}
          error={errors.description}
          placeholder="What did you spend on?"
        />

        <div className="form-row">
          <FormField
            label="Card Name"
            required
            value={formData.cardName}
            onChange={(value) => updateField('cardName', value)}
            error={errors.cardName}
            placeholder="e.g., Chase Sapphire"
          />
          
          <SelectInput
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(value) => updateField('category', value as TransactionCategory)}
            placeholder="Select category"
            clearable
          />
        </div>

        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel="Add Transaction"
          loading={loading}
          disabled={loading}
        />
      </Stack>
    </Paper>
  );
}

export function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);

  const handleAddTransaction = (data: TransactionFormData) => {
    console.log('Adding transaction:', data);
    // Here we would call the transaction store
    setShowForm(false);
  };

  return (
    <Container size="xl" className="container-responsive">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={1} mb="xs">
              Transactions
            </Title>
            <Text c="dimmed" size="lg">
              Track and manage your credit card transactions
            </Text>
          </div>
          
          {!showForm && (
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={() => setShowForm(true)}
            >
              Add Transaction
            </Button>
          )}
        </Group>

        {showForm ? (
          <TransactionForm
            onSubmit={handleAddTransaction}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <EmptyState
            title="No transactions recorded"
            description="Start tracking your spending by adding your first credit card transaction."
            icon={<IconCreditCard size={64} color="var(--mantine-color-gray-5)" />}
            actionLabel="Add Your First Transaction"
            onAction={() => setShowForm(true)}
          />
        )}
      </Stack>
    </Container>
  );
}