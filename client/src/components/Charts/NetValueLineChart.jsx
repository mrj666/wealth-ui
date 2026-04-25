import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function NetValueLineChart({ data, timeRange, accountName, onUpdateClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        暂无数据，请先添加账户和净值记录
      </div>
    );
  }

  // 格式化为万单位，不带小数点
  const formatWan = (v) => {
    if (v == null) return '';
    return `${Math.round(v / 10000)}万`;
  };

  // 格式化日期：只显示日期部分
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.slice(0, 10); // 截取 YYYY-MM-DD
  };

  // Tooltip 显示完整数值
  const formatTooltipValue = (v) => {
    if (v == null) return '';
    return Math.round(v).toLocaleString('zh-CN');
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {accountName || '资产净值走势'}
          </span>
          <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            {timeRange === 'daily' ? '每日' : timeRange === 'weekly' ? '每周' : '每月'}
          </span>
        </div>
        {onUpdateClick && (
          <button
            className="btn btn-primary"
            onClick={onUpdateClick}
            style={{ fontSize: 14, padding: '8px 16px' }}
          >
            更新净值
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickLine={false}
            tickFormatter={formatDate}
          />
          <YAxis
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickLine={false}
            tickFormatter={formatWan}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
            labelFormatter={formatDate}
            formatter={(value) => [formatTooltipValue(value), '净值']}
          />
          {!accountName && <Legend />}
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
            name="净值"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
