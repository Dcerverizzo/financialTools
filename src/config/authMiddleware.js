const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, '$2a$10$JIFxG3KOO6ezChidx1mRIeKmDc.zfDPTa8prJS5nCdaqi7BmHDYgq');
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

module.exports = authMiddleware;
