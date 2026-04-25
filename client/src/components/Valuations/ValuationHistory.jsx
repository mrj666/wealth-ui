export default function ValuationHistory({ valuations, currency }) {
  if (!valuations || valuations.length === 0) {
    return <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)', fontSize: 14 }}>暂无净值记录</div>;
  }

  const fmt = (v) => v != null ? parseFloat(v).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '—';

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-secondary)' }}>日期</th>
            <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)' }}>净值 ({currency})</th>
            <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)' }}>股票占比</th>
            <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-secondary)' }}>备注</th>
          </tr>
        </thead>
        <tbody>
          {valuations.map((v, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>{v.date}</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500 }}>{fmt(v.value)}</td>
              <td style={{ padding: '10px 0', textAlign: 'right', color: v.stock_ratio != null ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {v.stock_ratio != null ? `${v.stock_ratio}%` : '—'}
              </td>
              <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>{v.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
