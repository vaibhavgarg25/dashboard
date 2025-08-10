import { verifyToken } from '../utils/jwt.js';

export const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
