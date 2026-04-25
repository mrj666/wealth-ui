const express = require('express');
const router = express.Router();
const db = require('../db/init');

module.exports = function(app) {
  app.use('/api/accounts', router);

  // GET /api/accounts - 列出所有账户（含最新净值）
  router.get('/', (req, res) => {
    try {
      const accounts = db.prepare(`
        SELECT a.*,
          (SELECT v.value FROM valuations v WHERE v.account_id = a.id ORDER BY v.date DESC, v.id DESC LIMIT 1) as latest_value,
          (SELECT v.date FROM valuations v WHERE v.account_id = a.id ORDER BY v.date DESC, v.id DESC LIMIT 1) as latest_date
        FROM accounts a
        ORDER BY a.created_at DESC
      `).all();
      res.json(accounts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/accounts - 创建账户
  router.post('/', (req, res) => {
    try {
      const { name, currency, description, tags, stockRatio } = req.body;
      if (!name || !currency) {
        return res.status(400).json({ error: 'name and currency are required' });
      }
      const result = db.prepare(`
        INSERT INTO accounts (name, currency, description, tags, stock_ratio)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, currency, description || null, tags || null, stockRatio ?? 0);
      res.json({ id: result.lastInsertRowid, name, currency, description, tags, stock_ratio: stockRatio ?? 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/accounts/:id - 更新账户
  router.put('/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, currency, description, tags, stockRatio } = req.body;
      db.prepare(`
        UPDATE accounts
        SET name = COALESCE(?, name),
            currency = COALESCE(?, currency),
            description = ?,
            tags = ?,
            stock_ratio = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(name, currency, description, tags, stockRatio, id);
      res.json({ id: parseInt(id) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/accounts/:id - 删除账户
  router.delete('/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/accounts/:id/valuations - 查询净值历史
  router.get('/:id/valuations', (req, res) => {
    try {
      const { id } = req.params;
      const { range = 'daily', start, end } = req.query;

      const rangeSQL = {
        weekly: `
          SELECT strftime('%Y-%W', date) as date, MAX(value) as value, MAX(stock_ratio) as stock_ratio, MAX(note) as note
          FROM valuations WHERE account_id = ?`,
        monthly: `
          SELECT strftime('%Y-%m', date) as date, MAX(value) as value, MAX(stock_ratio) as stock_ratio, MAX(note) as note
          FROM valuations WHERE account_id = ?`,
        daily: `SELECT id, date, value, stock_ratio, note FROM valuations WHERE account_id = ?`
      };

      let sql = rangeSQL[range] || rangeSQL.daily;
      const params = [id];

      if (start) {
        sql += ' AND date >= ?';
        params.push(start);
      }
      if (end) {
        sql += ' AND date <= ?';
        params.push(end);
      }

      if (range === 'weekly' || range === 'monthly') {
        sql += ' GROUP BY ' + (range === 'weekly' ? "strftime('%Y-%W', date)" : "strftime('%Y-%m', date)");
        sql += ' ORDER BY date ASC';
      } else {
        sql += ' ORDER BY date ASC, id ASC';
      }

      const valuations = db.prepare(sql).all(...params);
      res.json(valuations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
