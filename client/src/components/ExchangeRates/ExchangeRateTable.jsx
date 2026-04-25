import { useState } from 'react';

const CURRENCY_LABELS = { USD: '美元 (USD)', HKD: '港币 (HKD)' };

export default function ExchangeRateTable({ rates, onRefresh, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = (rate) => {
    setEditing(rate.currency);
    setEditValue(rate.rate_to_rmb);
  };

  const handleSave = async (currency) => {
    await onUpdate(currency, parseFloat(editValue));
    setEditing(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValue('');
  };

  const fmtRate = (v) => parseFloat(v).toFixed(2);
  const fmtDate = (s) => {
    if (!s) return '—';
    const [datePart, timePart] = s.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    const utc8 = new Date(y, m - 1, d, hh + 8, mm);
    return `${utc8.getMonth() + 1}/${utc8.getDate()} ${utc8.getHours().toString().padStart(2, '0')}:${utc8.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>实时汇率</span>
        <button
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? '更新中...' : '从 API 更新'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rates.map(rate => (
          <div
            key={rate.currency}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--bg-primary)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{CURRENCY_LABELS[rate.currency]}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                1 {rate.currency} = ¥{fmtRate(rate.rate_to_rmb)} &nbsp;·&nbsp; 上次更新: {fmtDate(rate.updated_at)}
              </div>
            </div>

            {editing === rate.currency ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ width: 100 }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => handleSave(rate.currency)}>保存</button>
                <button className="btn btn-secondary btn-sm" onClick={handleCancel}>取消</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 15 }}>
                  ¥{fmtRate(rate.rate_to_rmb)}
                </span>
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(rate)}>编辑</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
        数据来源: exchangerate-api.com · 每次手动更新获取最新汇率
      </div>
    </div>
  );
}
