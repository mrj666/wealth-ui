import './AccountCard.css';

export default function AccountCard({ account, onEdit, onDelete }) {
  const fmt = (v) =>
    v != null ? v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  const tags = account.tags ? account.tags.split(',').filter(Boolean) : [];

  return (
    <div className="account-card card">
      <div className="account-card-header">
        <div>
          <div className="account-name">{account.name}</div>
          <div className="account-currency">{account.currency}</div>
        </div>
        <div className="account-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(account)}>编辑</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(account)}>删除</button>
        </div>
      </div>

      <div className="account-value">
        <span className="value-number">{fmt(account.latest_value)}</span>
        <span className="value-currency">{account.currency}</span>
      </div>

      {account.description && (
        <div className="account-description">{account.description}</div>
      )}

      {tags.length > 0 && (
        <div className="account-tags">
          {tags.map(t => <span key={t} className="tag">{t.trim()}</span>)}
        </div>
      )}

      {account.stock_ratio != null && account.stock_ratio > 0 && (
        <div className="account-stock-ratio">
          股票占比: {account.stock_ratio}%
        </div>
      )}
    </div>
  );
}
