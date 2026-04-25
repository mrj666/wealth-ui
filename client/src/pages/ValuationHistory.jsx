import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ValuationHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getValuationHistory().then(data => {
      setRecords(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  if (records.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>更新记录</h1>
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          暂无更新记录
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>更新记录</h1>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>日期</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>账户</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>净值</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>变化</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>股票占比</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>随记</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const change = r.prev_value != null ? r.value - r.prev_value : null;
              const isPositive = change > 0;
              const isNegative = change < 0;
              return (
                <tr key={i} style={{ borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.date}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                    {r.account_name}
                    <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--text-secondary)' }}>{r.currency}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                    {r.value.toLocaleString('zh-CN')}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                    {change !== null ? (
                      <span style={{ color: isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--text-secondary)' }}>
                        {isPositive ? '▲' : isNegative ? '▼' : ''} {isPositive ? '+' : ''}{change.toLocaleString('zh-CN')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {r.stock_ratio != null ? `${r.stock_ratio}%` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.note || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
