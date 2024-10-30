import type { PageLoad } from './$types';
import type { Transaction } from '$lib/types/admin';

export const load = (async () => {
  // Mock data - replace with actual API calls
  const transactions: Transaction[] = [
    {
      id: '1',
      userId: '1',
      type: 'credit',
      amount: 100,
      timestamp: '2024-01-01T10:00:00Z',
      adminId: 'admin1',
      reason: 'Bonus credit'
    },
    {
      id: '2',
      userId: '2',
      type: 'debit',
      amount: 50,
      timestamp: '2024-01-02T15:30:00Z',
      adminId: 'admin1',
      reason: 'Penalty'
    }
  ];

  return {
    transactions
  };
}) satisfies PageLoad;