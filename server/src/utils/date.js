function formatDate(date) {
  const d = new Date(date);
  const offset = 8 * 60; // UTC+8
  const localTime = new Date(d.getTime() + offset * 60 * 1000);
  return localTime.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = { formatDate };
