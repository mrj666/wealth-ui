import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useValuations(accountId, params = {}) {
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchValuations = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const data = await api.getValuations(accountId, params);
      setValuations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accountId, JSON.stringify(params)]);

  useEffect(() => { fetchValuations(); }, [fetchValuations]);

  const createValuation = async (data) => {
    await api.createValuation({ ...data, accountId });
    await fetchValuations();
  };

  return { valuations, loading, fetchValuations, createValuation };
}
