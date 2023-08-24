const app = require('express')();

const consign = require('consign');

consign({ cwd: 'src', verbose: false })
  .include('./config/middleware.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send();
});

app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  if (name === 'ValidationError' || name === 'RecurseInvalidError') {
    res.status(400).json({ error: message });
  } else {
    res.status(500).json({ name, message, stack });
  }
  next(err);
});

app.set('secret', '$2a$10$JIFxG3KOO6ezChidx1mRIeKmDc.zfDPTa8prJS5nCdaqi7BmHDYgq');

module.exports = app;
