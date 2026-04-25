import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const createAccount = async (data) => {
    const result = await api.createAccount(data);
    await fetchAccounts();
    return result;
  };

  const updateAccount = async (id, data) => {
    await api.updateAccount(id, data);
    await fetchAccounts();
  };

  const deleteAccount = async (id) => {
    await api.deleteAccount(id);
    await fetchAccounts();
  };

  return { accounts, loading, error, fetchAccounts, createAccount, updateAccount, deleteAccount };
}
