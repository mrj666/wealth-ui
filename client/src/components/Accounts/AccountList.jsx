import AccountCard from './AccountCard';
import './AccountList.css';

export default function AccountList({ accounts, onEdit, onDelete, filterTag }) {
  const filtered = filterTag
    ? accounts.filter(a => a.tags && a.tags.split(',').map(t => t.trim()).includes(filterTag))
    : accounts;

  if (filtered.length === 0) {
    return (
      <div className="account-list-empty">
        {filterTag ? `没有包含标签 "${filterTag}" 的账户` : '暂无账户，点击上方按钮添加'}
      </div>
    );
  }

  return (
    <div className="account-list">
      {filtered.map(acc => (
        <AccountCard
          key={acc.id}
          account={acc}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
