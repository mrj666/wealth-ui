const express = require('express');
const router = express.Router();
const db = require('../db/init');

module.exports = function(app) {
  app.use('/api/valuations', router);

  // POST /api/valuations - 添加净值（同日同账户覆盖旧值）
  router.post('/', (req, res) => {
    try {
      const { accountId, value, date, note, stockRatio, isInitialEdit } = req.body;
      if (!accountId || value === undefined || !date) {
        return res.status(400).json({ error: 'accountId, value, date are required' });
      }

      const run = db.transaction(() => {
        // 如果是编辑初始值，直接覆盖，不计算变化
        if (isInitialEdit) {
          // 先删同日旧记录（如果存在），再插入新记录
          db.prepare('DELETE FROM valuations WHERE account_id = ? AND date = ?').run(accountId, date);
          const result = db.prepare(`
            INSERT INTO valuations (account_id, value, date, note, stock_ratio)
            VALUES (?, ?, ?, ?, ?)
          `).run(accountId, value, date, note || null, stockRatio ?? null);
          return result;
        }

        // 正常更新净值：直接保存用户输入的 note，不添加变化金额
        // 先删同日旧记录（如果存在），再插入新记录
        db.prepare('DELETE FROM valuations WHERE account_id = ? AND date = ?').run(accountId, date);
        const result = db.prepare(`
          INSERT INTO valuations (account_id, value, date, note, stock_ratio)
          VALUES (?, ?, ?, ?, ?)
        `).run(accountId, value, date, note || null, stockRatio ?? null);

        return result;
      });

      const result = run();
      res.json({ id: result.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/valuations/history - 所有账户的更新记录（按日期降序）
  router.get('/history', (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT v.id, v.account_id, v.value, v.date, v.note, v.stock_ratio, v.created_at,
               a.name as account_name, a.currency,
               LAG(v.value) OVER (PARTITION BY v.account_id ORDER BY v.date ASC, v.id ASC) as prev_value
        FROM valuations v
        JOIN accounts a ON v.account_id = a.id
        ORDER BY v.date DESC, v.id DESC
      `).all();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
