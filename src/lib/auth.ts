import { db, User } from './db';

// Simple PIN hashing for demo (in production, use proper bcrypt or Web Crypto PBKDF2)
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  const pinHash = await hashPin(pin);
  return pinHash === hash;
}

export async function authenticateUser(username: string, pin: string): Promise<User | null> {
  const user = await db.users.where('username').equals(username).first();
  if (!user) return null;

  const isValid = await verifyPin(pin, user.pinHash);
  return isValid ? user : null;
}

export function getCurrentUser(): User | null {
  const userJson = sessionStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

export function setCurrentUser(user: User): void {
  sessionStorage.setItem('currentUser', JSON.stringify(user));
}

export function logout(): void {
  sessionStorage.removeItem('currentUser');
}
