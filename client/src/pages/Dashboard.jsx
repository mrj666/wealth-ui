import { useState, useEffect } from 'react';
import { useAggregatedAssets } from '../hooks/useAggregatedAssets';
import { useAccounts } from '../hooks/useAccounts';
import { api } from '../api';
import NetValueLineChart from '../components/Charts/NetValueLineChart';
import AllocationPieChart from '../components/Charts/AllocationPieChart';
import TimeRangeSelector from '../components/Charts/TimeRangeSelector';
import ValuationForm from '../components/Valuations/ValuationForm';
import ExchangeRateBar from '../components/ExchangeRates/ExchangeRateBar';

export default function Dashboard() {
  const { totalRmb, totalStockRatio, breakdown, loading, refetch } = useAggregatedAssets();
  const { accounts, fetchAccounts } = useAccounts();
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showValuationForm, setShowValuationForm] = useState(false);

  // 总资产走势独立时间维度
  const [totalRange, setTotalRange] = useState('monthly'); // 月:30 季:90 年:365
  const [totalHistory, setTotalHistory] = useState([]);
  const [loadingTotal, setLoadingTotal] = useState(false);

  const totalRangeDays = { monthly: 30, quarterly: 90, yearly: 365 }[totalRange] || 30;

  const loadTotalHistory = async () => {
    setLoadingTotal(true);
    try {
      const data = await api.getTotalHistory(totalRangeDays);
      setTotalHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTotal(false);
    }
  };

  useEffect(() => {
    loadTotalHistory();
  }, [totalRange]);

  const [accountValuations, setAccountValuations] = useState({});
  const [loadingValuations, setLoadingValuations] = useState({});

  const loadValuations = async (accountId, force = false) => {
    if (!force && accountValuations[accountId]) return;
    setLoadingValuations(prev => ({ ...prev, [accountId]: true }));
    try {
      const data = await api.getValuations(accountId, { range: timeRange });
      setAccountValuations(prev => ({ ...prev, [accountId]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingValuations(prev => ({ ...prev, [accountId]: false }));
    }
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    loadValuations(account.id, true);
  };

  // 首次加载完成后，自动加载所有账户的净值图表，并默认选中第一个有数据的账户
  useEffect(() => {
    if (!breakdown || breakdown.length === 0) return;
    // 默认选中第一个有净值的账户
    if (!selectedAccount) {
      const first = breakdown.find(acc => acc.valueRmb > 0);
      if (first) {
        setSelectedAccount({ ...first, id: first.accountId });
      }
    }
    breakdown.forEach(acc => {
      const id = acc.accountId;
      if (!accountValuations[id]) {
        loadValuations(id);
      }
    });
  }, [breakdown]);

  // timeRange 变化时，重新加载所有账户的图表数据
  useEffect(() => {
    if (!breakdown || breakdown.length === 0) return;
    breakdown.forEach(acc => {
      loadValuations(acc.accountId, true);
    });
  }, [timeRange]);

  const handleAddValuation = (account) => {
    setSelectedAccount(account);
    setShowValuationForm(true);
  };

  const handleValuationSaved = async (data) => {
    await api.createValuation(data);
    setShowValuationForm(false);
    await refetch();
    await fetchAccounts();
    if (selectedAccount && selectedAccount.id) {
      const vals = await api.getValuations(selectedAccount.id, { range: timeRange });
      setAccountValuations(prev => ({ ...prev, [selectedAccount.id]: vals }));
    }
  };

  const fmt = (v) => v != null ? v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ExchangeRateBar />

      {/* 汇总卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>总资产 (RMB)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
            ¥{fmt(totalRmb)}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>股票占比</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
            {fmt(totalStockRatio)}%
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>账户数量</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {breakdown?.length || 0}
          </div>
        </div>
      </div>

      {/* 图表区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>总资产走势</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['monthly', '月'], ['quarterly', '季'], ['yearly', '年']].map(([val, label]) => (
                <button
                  key={val}
                  className={`btn btn-sm ${totalRange === val ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTotalRange(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {loadingTotal ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>加载中...</div>
          ) : (
            <NetValueLineChart data={totalHistory} timeRange="daily" accountName="总资产走势" />
          )}
        </div>
        <AllocationPieChart breakdown={breakdown} />
      </div>

      {/* 账户净值历史 — 每账户一条折线图 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>账户净值历史</span>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {breakdown && breakdown.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
            {breakdown.map(acc => (
              <div key={acc.accountId}>
                {loadingValuations[acc.accountId] ? (
                  <div className="card" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>加载中...</div>
                ) : (
                  <NetValueLineChart
                    data={accountValuations[acc.accountId] || []}
                    timeRange={timeRange}
                    accountName={acc.name}
                    onUpdateClick={() => handleAddValuation({ ...acc, id: acc.accountId, stock_ratio: acc.stockRatio })}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
            暂无账户数据，请先在「账户管理」中添加账户
          </div>
        )}
      </div>

      {showValuationForm && selectedAccount && (
        <ValuationForm
          account={selectedAccount}
          onSave={handleValuationSaved}
          onClose={() => setShowValuationForm(false)}
        />
      )}
    </div>
  );
}
