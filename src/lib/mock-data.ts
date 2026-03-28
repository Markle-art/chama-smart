import { ReconcileMpesaTransactionInput } from '@/ai/flows/reconcile-mpesa-transaction-flow';

export const CHAMA_MEMBERS = [
  { id: 'm1', name: 'Brian Omondi', phone: '254712345678', nicknames: ['Breezy', 'Omoh'], totalContributed: 5500 },
  { id: 'm2', name: 'Stacy Wanjiru', phone: '254722334455', nicknames: ['Stace', 'Wanj'], totalContributed: 4200 },
  { id: 'm3', name: 'Kevin Mutua', phone: '254733445566', nicknames: ['Kevo', 'Mutua'], totalContributed: 6100 },
  { id: 'm4', name: 'Asha Mohamed', phone: '254744556677', nicknames: ['Ash'], totalContributed: 3000 },
  { id: 'm5', name: 'John Doe', phone: '254700000000', nicknames: ['JD'], totalContributed: 1500 },
];

export const CURRENT_CHAMA = {
  id: 'chama_123',
  name: 'UoN Computer Science 2024 Savings',
  targetGoalAmount: 100000,
  targetDate: '2024-12-31T23:59:59Z',
  startDate: '2024-01-01T00:00:00Z',
  currentTotalContributions: 20300,
};

export const RECENT_TRANSACTIONS = [
  {
    id: 't1',
    TransID: 'QWE123RTY',
    TransAmount: '1200',
    MSISDN: '254712345678',
    FirstName: 'Brian',
    BillRefNumber: 'June Contrib',
    status: 'reconciled',
    memberId: 'm1',
    date: '2024-06-15T14:30:00Z'
  },
  {
    id: 't2',
    TransID: 'UIO456PAS',
    TransAmount: '500',
    MSISDN: '254722334455',
    FirstName: 'Stacy',
    BillRefNumber: 'Chama',
    status: 'reconciled',
    memberId: 'm2',
    date: '2024-06-16T10:15:00Z'
  },
  {
    id: 't3',
    TransID: 'ZXC789VBN',
    TransAmount: '2000',
    MSISDN: '254755555555',
    FirstName: 'Kevo',
    BillRefNumber: 'Kevo payment',
    status: 'review',
    memberId: null,
    date: '2024-06-17T09:00:00Z'
  },
];

export const CONTRIBUTION_HISTORY = [
  { amount: 5000, date: '2024-01-15T10:00:00Z' },
  { amount: 4500, date: '2024-02-15T10:00:00Z' },
  { amount: 6000, date: '2024-03-15T10:00:00Z' },
  { amount: 4800, date: '2024-04-15T10:00:00Z' },
];