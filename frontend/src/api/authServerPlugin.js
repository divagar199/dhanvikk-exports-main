import crypto from 'node:crypto';

// Pre-seeded secure users for demonstration and testing of real auth
const DEMO_USERS = [
  {
    id: 'usr_cust_001',
    name: 'Aarav Patel',
    email: 'customer@dhanvikk.com',
    passwordHash: hashPassword('Bloom@2026'),
    role: 'customer',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr_adm_001',
    name: 'Dhanvikk Administrator',
    email: 'admin@dhanvikk.com',
    passwordHash: hashPassword('AdminBloom@2026'),
    role: 'admin',
    phone: '+91 98765 11111',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: '2025-11-01T08:00:00Z',
  },
  {
    id: 'usr_mgr_001',
    name: 'Priya Sharma (Store Manager)',
    email: 'manager@dhanvikk.com',
    passwordHash: hashPassword('Manager@2026'),
    role: 'manager',
    phone: '+91 98765 22222',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2025-12-01T08:00:00Z',
  }
];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_dhanvikk_salt').digest('hex');
}

function generateJwt(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'dhanvikk_blooms_secret_key_2026')
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function authServerPlugin() {
  return {
    name: 'dhanvikk-auth-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        if (!url.startsWith('/api/auth')) {
          return next();
        }

        // Helper to read JSON request body
        const getBody = () => new Promise((resolve, reject) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch (err) {
              reject(err);
            }
          });
          req.on('error', reject);
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        try {
          // POST /api/auth/login
          if (url === '/api/auth/login' && req.method === 'POST') {
            const body = await getBody();
            const { email, password } = body;

            // Input validation
            if (!email || !password) {
              res.statusCode = 422;
              return res.end(JSON.stringify({
                success: false,
                message: 'Email and password are required',
                errors: {
                  email: !email ? 'Email address is required' : undefined,
                  password: !password ? 'Password is required' : undefined,
                }
              }));
            }

            const cleanEmail = email.trim().toLowerCase();
            const hashedAttempt = hashPassword(password);

            const user = DEMO_USERS.find(u => u.email === cleanEmail);

            // Generic security error response to prevent user enumeration
            if (!user || user.passwordHash !== hashedAttempt) {
              res.statusCode = 401;
              return res.end(JSON.stringify({
                success: false,
                message: 'Incorrect email or password. Please try again.',
              }));
            }

            const token = generateJwt(user);

            // Return authenticated response without password hash
            const safeUser = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              avatar: user.avatar,
            };

            // Set secure HTTP-only cookie
            res.setHeader('Set-Cookie', [
              `dhanvikk_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
            ]);

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Login successful',
              user: safeUser,
              token,
            }));
          }

          // GET /api/auth/me
          if (url === '/api/auth/me' && req.method === 'GET') {
            const authHeader = req.headers.authorization;
            let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

            if (!token && req.headers.cookie) {
              const match = req.headers.cookie.match(/dhanvikk_token=([^;]+)/);
              if (match) token = match[1];
            }

            if (!token) {
              res.statusCode = 401;
              return res.end(JSON.stringify({
                success: false,
                message: 'Not authenticated',
              }));
            }

            try {
              const [, payloadB64] = token.split('.');
              const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
              const user = DEMO_USERS.find(u => u.id === payload.sub);

              if (!user) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ success: false, message: 'User not found' }));
              }

              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  phone: user.phone,
                  avatar: user.avatar,
                }
              }));
            } catch {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, message: 'Invalid session' }));
            }
          }

          // POST /api/auth/logout
          if (url === '/api/auth/logout' && req.method === 'POST') {
            res.setHeader('Set-Cookie', ['dhanvikk_token=; Path=/; HttpOnly; Max-Age=0']);
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Logged out successfully',
            }));
          }

          // POST /api/auth/google
          if (url === '/api/auth/google' && req.method === 'POST') {
            // Mock google verification flow
            const googleUser = DEMO_USERS[0];
            const token = generateJwt(googleUser);

            res.setHeader('Set-Cookie', [
              `dhanvikk_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
            ]);

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Google login successful',
              user: {
                id: googleUser.id,
                name: googleUser.name,
                email: googleUser.email,
                role: googleUser.role,
                phone: googleUser.phone,
                avatar: googleUser.avatar,
              },
              token,
            }));
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ success: false, message: 'Auth endpoint not found' }));
        } catch (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({
            success: false,
            message: 'Internal server error occurred',
          }));
        }
      });
    }
  };
}
