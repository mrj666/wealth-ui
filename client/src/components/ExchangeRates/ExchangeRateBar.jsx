import { useExchangeRates } from '../../hooks/useExchangeRates';

export default function ExchangeRateBar() {
  const { rates, loading, refreshRates } = useExchangeRates();

  const fmtRate = (v) => parseFloat(v).toFixed(4);
  const fmtTime = (s) => {
    if (!s) return '';
    const [datePart, timePart] = s.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    const utc8 = new Date(y, m - 1, d, hh + 8, mm);
    return `${utc8.getMonth() + 1}/${utc8.getDate()} ${utc8.getHours().toString().padStart(2, '0')}:${utc8.getMinutes().toString().padStart(2, '0')}`;
  };

  const usd = rates.find(r => r.currency === 'USD');
  const hkd = rates.find(r => r.currency === 'HKD');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: '12px 20px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      fontSize: 13,
    }}>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>汇率</span>

      {loading ? (
        <span style={{ color: 'var(--text-secondary)' }}>加载中...</span>
      ) : (
        <>
          {usd && (
            <span>
              <span style={{ color: 'var(--text-secondary)' }}>美元 (USD) </span>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>¥{fmtRate(usd.rate_to_rmb)}</span>
            </span>
          )}
          {hkd && (
            <span>
              <span style={{ color: 'var(--text-secondary)' }}>港币 (HKD) </span>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>¥{fmtRate(hkd.rate_to_rmb)}</span>
            </span>
          )}
        </>
      )}

      <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 'auto' }}>
        {rates.length > 0 && rates[0].updated_at ? `上次刷新 ${fmtTime(rates[0].updated_at)}` : ''}
      </span>

      <button
        className="btn btn-secondary btn-sm"
        onClick={refreshRates}
        style={{ fontSize: 12, padding: '3px 10px' }}
      >
        刷新
      </button>
    </div>
  );
}
