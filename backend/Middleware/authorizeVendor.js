module.exports = (req, res, next) => {
  console.log('[VENDOR DEBUG] Checking role for user:', req.user.role);
  if (req.user.role !== 'vendor') {
    console.error('[VENDOR DEBUG] Access denied - Role is not vendor:', req.user.role);
    return res.status(403).json({ message: 'Vendor access required' });
  }
  console.log('[VENDOR DEBUG] Vendor access granted');
  next();
};