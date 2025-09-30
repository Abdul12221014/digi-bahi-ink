import Dexie, { Table } from 'dexie';

export interface User {
  id?: number;
  username: string;
  pinHash: string;
  role: 'owner' | 'accountant' | 'employee';
  createdAt: Date;
}

export interface LedgerEntry {
  id?: number;
  date: string;
  description: string;
  amount: number;
  type: 'sale' | 'purchase' | 'expense' | 'receipt';
  gstRate: number;
  gstAmount: number;
  userId: number;
  createdAt: Date;
}

export interface GSTRecord {
  id?: number;
  ledgerId: number;
  taxAmount: number;
  status: 'pending' | 'filed';
  createdAt: Date;
}

export class DigBahiDB extends Dexie {
  users!: Table<User>;
  ledger!: Table<LedgerEntry>;
  gstRecords!: Table<GSTRecord>;

  constructor() {
    super('digbahi');
    this.version(1).stores({
      users: '++id, username, role',
      ledger: '++id, date, type, userId, createdAt',
      gstRecords: '++id, ledgerId, status, createdAt'
    });
  }
}

export const db = new DigBahiDB();

// Initialize with demo user if empty
export async function initializeDB() {
  const userCount = await db.users.count();
  if (userCount === 0) {
    // Demo PIN: "1234" - SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode('1234');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    await db.users.add({
      username: 'demo',
      pinHash,
      role: 'owner',
      createdAt: new Date()
    });
  }
}
