import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AllocationPieChart({ breakdown }) {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="card" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        暂无账户数据
      </div>
    );
  }

  // 按净值大小降序排序（从左到右从大到小）
  const data = breakdown
    .filter(b => b.valueRmb > 0)
    .map(b => ({
      name: b.name,
      value: Math.round(b.valueRmb * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value);

  // 计算总资产
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // 格式化为万单位
  const formatWan = (v) => {
    if (v == null) return '';
    return `${Math.round(v / 10000)}万`;
  };

  // Tooltip 显示完整数值和占比
  const formatTooltipValue = (v) => {
    if (v == null) return '';
    const percentage = ((v / total) * 100).toFixed(1);
    return [`¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentage}%)`, '净值'];
  };

  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>资产配置</span>
        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-secondary)' }}>按账户分布</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickLine={false}
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
            formatter={formatTooltipValue}
          />
          <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
