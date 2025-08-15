const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'zeus_secret_key';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'توكن غير صالح أو منتهي' });
    }
}

module.exports = authMiddleware;
