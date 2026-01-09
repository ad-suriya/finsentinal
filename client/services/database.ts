
import { Transaction } from '../types';
import { INITIAL_MOCK_DATA } from '../constants';

const DB_KEY = 'vvfnt_database_v1';

export const db = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_MOCK_DATA));
      return INITIAL_MOCK_DATA;
    }
    return JSON.parse(data);
  },

  saveTransactions: (txs: Transaction[]) => {
    localStorage.setItem(DB_KEY, JSON.stringify(txs));
  },

  addTransaction: (tx: Transaction) => {
    const txs = db.getTransactions();
    const updated = [tx, ...txs];
    db.saveTransactions(updated);
    return tx;
  },

  updateTransaction: (id: string, updates: Partial<Transaction>) => {
    const txs = db.getTransactions();
    const index = txs.findIndex(t => t.id === id);
    if (index !== -1) {
      txs[index] = { ...txs[index], ...updates };
      db.saveTransactions(txs);
      return txs[index];
    }
    return null;
  }
};
