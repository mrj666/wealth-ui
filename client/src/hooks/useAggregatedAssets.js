import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useAggregatedAssets() {
  const [data, setData] = useState({ totalRmb: 0, totalStockRatio: 0, breakdown: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getAggregated();
      setData(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
}
