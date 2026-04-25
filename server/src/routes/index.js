// 路由中央注册表
// 新增路由必须在此注册，否则不会生效
module.exports = function registerRoutes(app) {
  require('./accounts')(app);
  require('./valuations')(app);
  require('./exchangeRates')(app);
  require('./aggregated')(app);
};
