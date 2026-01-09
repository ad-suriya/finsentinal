
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Transaction, Status } from '../types';
import { SCENARIOS, EXPLANATIONS } from '../constants';
import { TransactionsAPI } from '../services/api';

interface TransactionContextType {
  transactions: Transaction[];
  refreshData: () => Promise<void>;
  updateTxStatus: (id: string, status: Status) => Promise<void>;
  startNormalTraffic: () => void;
  startFraudBurst: () => void;
  stopSimulation: () => void;
  resetDatabase: () => Promise<void>;
  simulationActive: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [simulationActive, setSimulationActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const refreshData = useCallback(async () => {
    const data = await TransactionsAPI.getAll();
    setTransactions(data);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const generateRandomTx = (forcedStatus?: Status): Transaction => {
    const id = `tx_${Math.random().toString(36).substr(2, 9)}`;
    const hashId = Math.random().toString(36).substr(2, 8);
    const amount = Math.floor(Math.random() * 200000) + 1000;
    const status: Status = forcedStatus || (Math.random() > 0.8 ? "FLAGGED" : "APPROVED");
    const score = status === "APPROVED" ? Math.random() * 0.3 : (status === "FLAGGED" ? 0.4 + Math.random() * 0.4 : 0.8 + Math.random() * 0.2);
    
    return {
      id,
      hashId,
      timestamp: new Date().toISOString(),
      amount,
      score,
      status,
      scenario: SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)],
      explanation: EXPLANATIONS[Math.floor(Math.random() * EXPLANATIONS.length)],
      entity: Math.random() > 0.5 ? "Bank A" : "Bank B"
    };
  };

  const startNormalTraffic = () => {
    stopSimulation();
    setSimulationActive(true);
    intervalRef.current = window.setInterval(async () => {
      const newTx = generateRandomTx("APPROVED");
      await TransactionsAPI.create(newTx);
      setTransactions(prev => [newTx, ...prev]);
    }, 3000);
  };

  const startFraudBurst = async () => {
    setSimulationActive(true);
    const bursts = [];
    for (let i = 0; i < 3; i++) {
      const newTx = generateRandomTx("BLOCKED");
      bursts.push(newTx);
      await TransactionsAPI.create(newTx);
    }
    setTransactions(prev => [...bursts, ...prev]);
  };

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSimulationActive(false);
  };

  const resetDatabase = async () => {
    stopSimulation();
    await TransactionsAPI.resetSystem();
    await refreshData();
  };

  const updateTxStatus = async (id: string, status: Status) => {
    const updated = await TransactionsAPI.updateStatus(id, status);
    if (updated) {
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    }
  };

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      refreshData,
      updateTxStatus,
      startNormalTraffic, 
      startFraudBurst, 
      stopSimulation,
      resetDatabase,
      simulationActive
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error("useTransactions must be used within TransactionProvider");
  return context;
};
