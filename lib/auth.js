const jwt = require('jsonwebtoken');

/*
 * Function to require authentication
 */
function requireAuth(req, res, next) {
    const auth_header = req.get('Authorization') || '';
    const header_parts = auth_header.split(' ');
    const auth_token = header_parts[0] == 'Bearer' ? header_parts[1] : null;

    try {
        const payload = jwt.verify(auth_token, process.env.JWT_SECRET);
        req.user = payload.sub;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' })
    }
}

function generateAuthToken(user) {
    const payload = { "sub": user };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

module.exports = {
    requireAuth,
    generateAuthToken
}
