import { useState } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { api } from '../api';
import AccountList from '../components/Accounts/AccountList';
import AccountForm from '../components/Accounts/AccountForm';
import ValuationForm from '../components/Valuations/ValuationForm';
import { useAggregatedAssets } from '../hooks/useAggregatedAssets';

export default function Accounts() {
  const { accounts, loading, createAccount, updateAccount, deleteAccount, fetchAccounts } = useAccounts();
  const { refetch } = useAggregatedAssets();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [valuationTarget, setValuationTarget] = useState(null);
  const [filterTag, setFilterTag] = useState('');

  const allTags = [...new Set(
    accounts.flatMap(a => a.tags ? a.tags.split(',').map(t => t.trim()) : [])
  )];

  const handleSave = async (data) => {
    const { initialValue, initialDate, ...accountData } = data;
    if (editingAccount) {
      await updateAccount(editingAccount.id, accountData);
      // 编辑模式：如果提供了初始净值，直接覆盖（不留更新记录）
      if (initialValue !== null && !isNaN(initialValue)) {
        await api.createValuation({
          accountId: editingAccount.id,
          value: initialValue,
          date: initialDate,
          stockRatio: accountData.stockRatio || null,
          isInitialEdit: true,
        });
      }
    } else {
      const account = await createAccount(accountData);
      if (initialValue !== null && !isNaN(initialValue)) {
        await api.createValuation({
          accountId: account.id,
          value: initialValue,
          date: initialDate,
          stockRatio: accountData.stockRatio || null,
          isInitialEdit: true,
        });
      }
    }
    setShowForm(false);
    setEditingAccount(null);
    await refetch();
    await fetchAccounts();
  };

  const handleDelete = async (account) => {
    if (!confirm(`确定删除账户 "${account.name}"？所有净值记录也将被删除。`)) return;
    await deleteAccount(account.id);
    await refetch();
  };

  const handleEdit = async (account) => {
    // 获取最早的净值记录作为初始值
    const valuations = await api.getValuations(account.id);
    const initialValuation = valuations[0]; // 已按日期 ASC 排序
    setEditingAccount({
      ...account,
      initialValue: initialValuation?.value || '',
      initialDate: initialValuation?.date ? initialValuation.date.slice(0, 10) : account.created_at?.slice(0, 10) || '',
    });
    setShowForm(true);
  };

  const handleAddValuation = (account) => {
    setValuationTarget(account);
  };

  const handleValuationSaved = async (data) => {
    await api.createValuation(data);
    setValuationTarget(null);
    await refetch();
    await fetchAccounts();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>账户管理</h1>
        <button className="btn btn-primary" onClick={() => { setEditingAccount(null); setShowForm(true); }}>
          + 添加账户
        </button>
      </div>

      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>标签筛选:</span>
          <button
            className={`btn btn-sm ${filterTag === '' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterTag('')}
          >
            全部
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`btn btn-sm ${filterTag === tag ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <AccountList
          accounts={accounts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          filterTag={filterTag}
        />
      )}

      {showForm && (
        <AccountForm
          account={editingAccount}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingAccount(null); }}
        />
      )}

      {valuationTarget && (
        <ValuationForm
          account={valuationTarget}
          onSave={handleValuationSaved}
          onClose={() => setValuationTarget(null)}
        />
      )}
    </div>
  );
}
