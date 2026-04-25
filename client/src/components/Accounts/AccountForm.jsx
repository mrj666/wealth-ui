import { useState, useEffect } from 'react';

export default function AccountForm({ account, onSave, onClose }) {
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const [form, setForm] = useState({
    name: '',
    currency: 'RMB',
    description: '',
    tags: '',
    stockRatio: 0,
    initialValue: '',
    initialDate: today,
  });

  useEffect(() => {
    if (account) {
      // 编辑模式：填充现有数据（包括初始净值）
      setForm({
        name: account.name || '',
        currency: account.currency || 'RMB',
        description: account.description || '',
        tags: account.tags || '',
        stockRatio: account.stock_ratio || 0,
        initialValue: account.initialValue || '',
        initialDate: account.initialDate || today,
      });
    }
  }, [account, today]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name,
      currency: form.currency,
      description: form.description,
      tags: form.tags,
      stockRatio: parseInt(form.stockRatio, 10) || 0,
      initialValue: form.initialValue !== '' ? parseInt(form.initialValue, 10) : null,
      initialDate: form.initialDate,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{account ? '编辑账户' : '添加账户'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>账户名称</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="如：招商银行储蓄卡"
                required
              />
            </div>
            <div className="form-group">
              <label>初始净值 ({form.currency})</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.initialValue}
                onChange={e => setForm(f => ({ ...f, initialValue: e.target.value }))}
                placeholder="可选"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>标签（逗号分隔）</label>
              <input
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="如：储蓄,应急资金"
              />
            </div>
            <div className="form-group">
              <label>初始净值日期</label>
              <input
                type="date"
                value={form.initialDate}
                onChange={e => setForm(f => ({ ...f, initialDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>币种</label>
              <select
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              >
                <option value="RMB">人民币 (RMB)</option>
                <option value="USD">美元 (USD)</option>
                <option value="HKD">港币 (HKD)</option>
              </select>
            </div>
            <div className="form-group">
              <label>股票占比 (%)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.stockRatio}
                onChange={e => setForm(f => ({ ...f, stockRatio: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>备注</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="可选"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              保存
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
