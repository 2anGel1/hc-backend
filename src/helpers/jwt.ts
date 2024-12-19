const jwt = require('jsonwebtoken');

export const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET || 'victus_jwt_secret_phrase';
  const token = jwt.sign({ id: userId }, secret, { expiresIn: '2h' });
  return token;
};
