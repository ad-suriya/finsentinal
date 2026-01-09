
import { 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  getDoc,
  writeBatch
} from "firebase/firestore";
import { db } from './firebase';
import { Transaction } from '../types';
import { INITIAL_MOCK_DATA } from '../constants';

const COLLECTION_NAME = "transactions";

// Helper to ensure we always have a valid ISO string for timestamps
// and explicitly constructs the object to avoid circular references from Firestore internals
const normalizeTransaction = (data: any, id?: string): Transaction => {
  let timestamp = data.timestamp;
  
  // If it's a Firestore Timestamp object, convert to Date then ISO string
  if (timestamp && typeof timestamp.toDate === 'function') {
    timestamp = timestamp.toDate().toISOString();
  } else if (!timestamp) {
    timestamp = new Date().toISOString();
  } else if (typeof timestamp !== 'string') {
    // Fallback for any other non-string types
    timestamp = new Date().toISOString();
  }
  
  return {
    id: data.id || id || 'unknown',
    hashId: data.hashId || 'unknown',
    timestamp: timestamp,
    amount: Number(data.amount) || 0,
    score: Number(data.score) || 0,
    status: data.status || 'FLAGGED',
    scenario: data.scenario || 'UNKNOWN',
    explanation: data.explanation || '',
    entity: data.entity || 'Bank A'
  };
};

export const TransactionsAPI = {
  // GET /v1/transactions (Ordered by timestamp)
  getAll: async (): Promise<Transaction[]> => {
    console.log('API CALL: GET /transactions [FIREBASE]');
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      
      const transactions = querySnapshot.docs.map(d => normalizeTransaction(d.data(), d.id));

      // Self-seeding: If DB is fresh, hydrate it with default patterns
      if (transactions.length === 0) {
        console.warn('DB EMPTY: Seeding cloud infrastructure with initial vectors...');
        await TransactionsAPI.resetSystem(); // Reuse the reset logic for seeding
        // Recursively fetch the newly seeded data
        const retrySnapshot = await getDocs(q);
        return retrySnapshot.docs.map(d => normalizeTransaction(d.data(), d.id));
      }

      return transactions;
    } catch (error) {
      console.error('FIREBASE_FETCH_ERROR:', error);
      return [];
    }
  },
  
  // GET /v1/transactions/:id
  getById: async (id: string): Promise<Transaction | undefined> => {
    console.log(`API CALL: GET /transactions/${id} [FIREBASE]`);
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? normalizeTransaction(docSnap.data(), docSnap.id) : undefined;
    } catch (error) {
      console.error('FIREBASE_GET_BY_ID_ERROR:', error);
      return undefined;
    }
  },

  // POST /v1/transactions
  create: async (tx: Transaction): Promise<Transaction> => {
    console.log(`API CALL: POST /transactions [FIREBASE] ID: ${tx.id}`);
    try {
      // Clean object before sending to Firestore to avoid any issues
      const cleanTx = normalizeTransaction(tx);
      // Using setDoc with pre-generated app-level ID to maintain hash consistency
      await setDoc(doc(db, COLLECTION_NAME, tx.id), cleanTx);
      return cleanTx;
    } catch (error) {
      console.error('FIREBASE_CREATE_ERROR:', error);
      throw error;
    }
  },

  // PATCH /v1/transactions/:id
  updateStatus: async (id: string, status: "APPROVED" | "FLAGGED" | "BLOCKED"): Promise<Transaction | null> => {
    console.log(`API CALL: PATCH /transactions/${id} { status: ${status} } [FIREBASE]`);
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { status });
      
      // Return the updated object
      const updatedSnap = await getDoc(docRef);
      if (updatedSnap.exists()) {
        return normalizeTransaction(updatedSnap.data(), updatedSnap.id);
      }
      return null;
    } catch (error) {
      console.error('FIREBASE_UPDATE_ERROR:', error);
      return null;
    }
  },

  // SYSTEM: Reset Database
  resetSystem: async (): Promise<void> => {
    console.log('API CALL: SYSTEM_RESET [FIREBASE]');
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snapshot = await getDocs(q);
      
      // Batch delete for efficiency
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      console.log('SYSTEM: Database Wiped. Re-seeding...');

      // Re-seed with fresh timestamps
      const now = Date.now();
      const freshData = INITIAL_MOCK_DATA.map((tx, i) => ({
        ...tx,
        // Stagger timestamps: 5 mins ago, 15 mins ago, etc.
        timestamp: new Date(now - 1000 * 60 * ((i + 1) * 10)).toISOString()
      }));

      for (const tx of freshData) {
        await TransactionsAPI.create(tx);
      }
      console.log('SYSTEM: Re-seed Complete.');
    } catch (error) {
      console.error('FIREBASE_RESET_ERROR:', error);
    }
  }
};

export const EntitiesAPI = {
  getHealth: async () => {
    console.log('API CALL: GET /entities/health [MOCK]');
    // Mocking this as static telemetry for now
    return [
      { name: "Bank A", score: 98, status: "Healthy" },
      { name: "Bank B", score: 85, status: "Under Review" }
    ];
  }
};
