export interface User {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'disabled';
  balance: number;
  lastLogin: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  timestamp: string;
  adminId: string;
  reason: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: 'credit' | 'debit' | 'disable' | 'enable';
  targetUserId: string;
  timestamp: string;
  details: string;
}