const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error);
  }
  return res.json();
}

export const api = {
  // Accounts
  getAccounts: () => request('/accounts'),
  createAccount: (data) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),
  getValuations: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/accounts/${id}/valuations${qs ? '?' + qs : ''}`);
  },

  // Valuations
  createValuation: (data) => request('/valuations', { method: 'POST', body: JSON.stringify(data) }),
  getValuationHistory: () => request('/valuations/history'),

  // Exchange rates
  getExchangeRates: () => request('/exchange-rates'),
  refreshExchangeRates: () => request('/exchange-rates/refresh', { method: 'POST' }),
  updateExchangeRate: (currency, rateToRmb) =>
    request(`/exchange-rates/${currency}`, { method: 'PUT', body: JSON.stringify({ rateToRmb }) }),

  // Aggregated
  getAggregated: () => request('/aggregated'),
  getTotalHistory: (days) => request(`/aggregated/total-history?days=${days}`),
};
