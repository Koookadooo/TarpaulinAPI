const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

/*
 * Function to require authentication
 */
async function requireAuth(req, res, next) {
    const auth_header = req.get('Authorization') || '';
    const header_parts = auth_header.split(' ');
    const auth_token = header_parts[0] == 'Bearer' ? header_parts[1] : null;

    if (!auth_token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const payload = jwt.verify(auth_token, process.env.JWT_SECRET);
        const user = await User.findByPk(payload.sub); // Fetch full user object
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = user
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

/*
 * Function to generate an authentication token
 */
function generateAuthToken(user) {
    const payload = { "sub": user };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

/*
 * Function to check required Role
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
    };
}

module.exports = {
    requireAuth,
    generateAuthToken,
    requireRole
}
