const app = require('../../backend/server');

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api(?=\/|$)/, '') || '/';
  return app(req, res);
};
