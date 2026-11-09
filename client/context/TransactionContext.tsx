
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Transaction, Status } from '../types';
import { TransactionsAPI } from '../services/api';
import { RiskResult, scoreRisk } from '../services/backend';
import { sha256Hex } from '../services/hashing';

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

const STATUS_FROM_RISK: Record<RiskResult['status'], Status> = {
  APPROVE: "APPROVED",
  REVIEW: "FLAGGED",
  BLOCKED: "BLOCKED"
};

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

  // Simulated traffic varies by random inputs. Its risk result always comes from the server's rules.
  const generateTx = async (profile: "NORMAL" | "FRAUD"): Promise<Transaction> => {
    const fraud = profile === "FRAUD";
    const amount = fraud ? 20000 + Math.floor(Math.random() * 180000) : 1000 + Math.floor(Math.random() * 7000);
    const risk = await scoreRisk({ amount, mcc: fraud ? "7995" : "5411", merchantId: fraud ? "Unknown Vendor" : "Local Grocery" });
    const hashId = await sha256Hex(`simulated_user_${Math.floor(Math.random() * 50)}`);

    return {
      id: `tx_${crypto.randomUUID()}`,
      hashId: hashId.slice(0, 8),
      timestamp: new Date().toISOString(),
      amount,
      score: risk.score / 100,
      status: STATUS_FROM_RISK[risk.status],
      scenario: risk.rules[0] ?? "NORMAL_PATTERN",
      explanation: risk.reasons.join(" "),
      entity: Math.random() > 0.5 ? "Bank A" : "Bank B"
    };
  };

  const startNormalTraffic = () => {
    stopSimulation();
    setSimulationActive(true);
    intervalRef.current = window.setInterval(async () => {
      try {
        const newTx = await generateTx("NORMAL");
        await TransactionsAPI.create(newTx);
        setTransactions(prev => [newTx, ...prev]);
      } catch (error) {
        console.error('SIMULATION_ERROR:', error);
        stopSimulation();
      }
    }, 3000);
  };

  const startFraudBurst = async () => {
    setSimulationActive(true);
    try {
      const bursts: Transaction[] = [];
      for (let i = 0; i < 3; i++) {
        const newTx = await generateTx("FRAUD");
        bursts.push(newTx);
        await TransactionsAPI.create(newTx);
      }
      setTransactions(prev => [...bursts, ...prev]);
    } catch (error) {
      console.error('SIMULATION_ERROR:', error);
      setSimulationActive(false);
    }
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
