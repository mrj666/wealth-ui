function convertToRmb(value, currency, rates) {
  if (currency === 'RMB') return value;
  const rate = rates.find(r => r.currency === currency);
  if (!rate) return value;
  return value * rate.rate_to_rmb;
}

module.exports = { convertToRmb };
