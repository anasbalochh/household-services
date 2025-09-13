const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('authorization') || req.get('Authorization') || '';
  console.log('[AUTH DEBUG] Authorization header:', authHeader ? 'Present' : 'Missing');

  // Accept both: "Authorization: Bearer <token>" and "Authorization: <token>"
  let token = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (!token) {
    console.log('[AUTH DEBUG] No token provided - returning 401');
    return res.status(401).json({ message: 'No token provided' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('[AUTH DEBUG] JWT_SECRET is missing - returning 500');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  console.log('[AUTH DEBUG] Token preview:', token.substring(0, 10) + '...');

  try {
    // Correct usage: do not pass sign options (like expiresIn) to verify()
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH DEBUG] Token verified - User:', { id: decoded.id, role: decoded.role });
    req.user = decoded; // { id, role, email, iat, exp }
    return next();
  } catch (err) {
    console.error('[AUTH DEBUG] Token verification failed:', err.name, err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
