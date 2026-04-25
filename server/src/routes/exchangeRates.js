const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const db = require('../db/init');
require('dotenv').config();

module.exports = function(app) {
  app.use('/api/exchange-rates', router);

  // GET /api/exchange-rates - 列出所有汇率
  router.get('/', (req, res) => {
    try {
      const rates = db.prepare('SELECT * FROM exchange_rates ORDER BY currency').all();
      res.json(rates);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/exchange-rates/refresh - 从 API 重新拉取汇率
  router.post('/refresh', async (req, res) => {
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'EXCHANGERATE_API_KEY not configured' });
    }

    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
      const data = await response.json();

      if (data.result !== 'success') {
        return res.status(502).json({ error: 'Failed to fetch from exchange rate API', detail: data });
      }

      const usdToRmb = data.conversion_rates['CNY'];
      const hkdToRmb = data.conversion_rates['CNY'] / data.conversion_rates['HKD'];

      const update = db.prepare(`
        UPDATE exchange_rates SET rate_to_rmb = ?, updated_at = datetime('now') WHERE currency = ?
      `);

      update.run(usdToRmb, 'USD');
      update.run(hkdToRmb, 'HKD');

      const rates = db.prepare('SELECT * FROM exchange_rates ORDER BY currency').all();
      res.json({ success: true, rates });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/exchange-rates/:currency - 手动更新汇率
  router.put('/:currency', (req, res) => {
    try {
      const { currency } = req.params;
      const { rateToRmb } = req.body;
      if (!['USD', 'HKD'].includes(currency)) {
        return res.status(400).json({ error: 'currency must be USD or HKD' });
      }
      db.prepare(`
        UPDATE exchange_rates SET rate_to_rmb = ?, updated_at = datetime('now') WHERE currency = ?
      `).run(rateToRmb, currency);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
