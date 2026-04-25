import { useState } from 'react';

export default function ValuationForm({ account, onSave, onClose }) {
  const [form, setForm] = useState({
    value: '',
    date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
    note: '',
    stockRatio: account.stock_ratio || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      accountId: account.id,
      value: parseInt(form.value, 10),
      date: form.date,
      note: form.note,
      stockRatio: form.stockRatio !== '' ? parseInt(form.stockRatio, 10) : null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>更新净值 — {account.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>净值 ({account.currency})</label>
<input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="0"
                required
              />
            </div>
            <div className="form-group">
              <label>日期</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>股票占比 (%)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.stockRatio}
              onChange={e => setForm(f => ({ ...f, stockRatio: e.target.value }))}
              placeholder="留空则沿用账户当前值"
            />
          </div>

          <div className="form-group">
            <label>随记</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
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
