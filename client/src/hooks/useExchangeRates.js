import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useExchangeRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getExchangeRates();
      setRates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const refreshRates = async () => {
    await api.refreshExchangeRates();
    await fetchRates();
  };

  const updateRate = async (currency, rateToRmb) => {
    await api.updateExchangeRate(currency, rateToRmb);
    await fetchRates();
  };

  return { rates, loading, fetchRates, refreshRates, updateRate };
}
