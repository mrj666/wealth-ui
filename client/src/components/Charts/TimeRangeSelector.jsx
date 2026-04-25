export default function TimeRangeSelector({ value, onChange }) {
  return (
    <div className="time-range-selector">
      {['daily', 'weekly', 'monthly'].map(range => (
        <button
          key={range}
          className={`btn btn-sm ${value === range ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange(range)}
        >
          {range === 'daily' ? '日' : range === 'weekly' ? '周' : '月'}
        </button>
      ))}
    </div>
  );
}
