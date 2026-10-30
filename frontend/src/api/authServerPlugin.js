import crypto from 'node:crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_dhanvikk_salt').digest('hex');
}

// Pre-seeded secure users for demonstration and testing of real auth
const DEMO_USERS = [
  {
    id: 'usr_super_adm_001',
    staffId: 'STF-SUPER-01',
    name: 'Divagar M (Super Admin)',
    email: 'divagar.m.msc.cs@gmail.com',
    passwordHash: hashPassword('admin@2026'),
    role: 'super_admin',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T08:00:00Z',
  },
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
];

const USER_STORAGE = new Map();

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

        if (!url.startsWith('/api/auth') && !url.startsWith('/api/admin/staff')) {
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
          if (url.startsWith('/api/auth/login') && req.method === 'POST') {
            const body = await getBody();
            const { email, password } = body;

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

            const user = DEMO_USERS.find(
              (u) => u.email === cleanEmail || (u.staffId && u.staffId.toLowerCase() === cleanEmail)
            );

            if (!user || user.passwordHash !== hashedAttempt) {
              res.statusCode = 401;
              return res.end(JSON.stringify({
                success: false,
                message: 'Incorrect email or password. Please try again.',
              }));
            }

            const token = generateJwt(user);

            const safeUser = {
              id: user.id,
              staffId: user.staffId,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              avatar: user.avatar,
            };

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

          // POST /api/auth/register
          if (url.startsWith('/api/auth/register') && req.method === 'POST') {
            const body = await getBody();
            const { name, email, password, phone } = body;

            if (!email || !password) {
              res.statusCode = 422;
              return res.end(JSON.stringify({
                success: false,
                message: 'Email and password are required',
              }));
            }

            const cleanEmail = email.trim().toLowerCase();
            let user = DEMO_USERS.find((u) => u.email === cleanEmail);
            if (user) {
              // Return error if already registered with different pass
              res.statusCode = 409;
              return res.end(JSON.stringify({
                success: false,
                message: 'An account with this email address already exists. Please log in.',
              }));
            }

            const newUser = {
              id: `usr_${Date.now()}`,
              name: name || cleanEmail.split('@')[0],
              email: cleanEmail,
              passwordHash: hashPassword(password),
              role: 'customer',
              phone: phone || '',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || cleanEmail)}&background=800020&color=d4af37&bold=true&size=256`,
              createdAt: new Date().toISOString(),
            };

            DEMO_USERS.push(newUser);
            const token = generateJwt(newUser);

            res.setHeader('Set-Cookie', [
              `dhanvikk_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
            ]);

            res.statusCode = 201;
            return res.end(JSON.stringify({
              success: true,
              message: 'Account registered successfully!',
              user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                avatar: newUser.avatar,
              },
              token,
            }));
          }

          // GET /api/auth/profile-data
          if (url.startsWith('/api/auth/profile-data')) {
            const emailParam = new URL(url, 'http://localhost').searchParams.get('email') || req.headers['x-user-email'] || '';
            const clean = (emailParam || '').trim().toLowerCase();
            const data = USER_STORAGE.get(clean) || {};
            const user = DEMO_USERS.find(u => u.email === clean) || {
              name: clean ? clean.split('@')[0] : 'Valued Patron',
              email: clean,
              role: 'customer',
            };

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              user,
              cart: data.cart || [],
              savedAddresses: data.savedAddresses || [],
              savedBouquets: data.savedBouquets || [],
              recentOrders: data.recentOrders || [],
            }));
          }

          // POST /api/auth/cart
          if (url.startsWith('/api/auth/cart') && req.method === 'POST') {
            const body = await getBody();
            const clean = (body.email || req.headers['x-user-email'] || '').trim().toLowerCase();
            if (clean) {
              const current = USER_STORAGE.get(clean) || {};
              USER_STORAGE.set(clean, { ...current, cart: body.cart || [] });
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, cart: body.cart || [] }));
          }

          // POST /api/auth/addresses
          if (url.startsWith('/api/auth/addresses') && req.method === 'POST') {
            const body = await getBody();
            const clean = (body.email || req.headers['x-user-email'] || '').trim().toLowerCase();
            if (clean) {
              const current = USER_STORAGE.get(clean) || {};
              const list = current.savedAddresses || [];
              const newAddr = { id: `addr_${Date.now()}`, ...body };
              list.push(newAddr);
              USER_STORAGE.set(clean, { ...current, savedAddresses: list });
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, address: body }));
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
                  staffId: user.staffId,
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
            const body = await getBody();
            const { name, email, avatar, googleUid, phone } = body || {};

            const cleanEmail = (email || '').trim().toLowerCase();
            const targetName = name || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
            const targetId = googleUid || `usr_g_${Date.now()}`;

            const realGoogleUser = {
              id: targetId,
              name: targetName,
              email: cleanEmail,
              role: 'customer',
              phone: phone || '',
              avatar: avatar || (cleanEmail ? `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}` : ''),
            };
            const token = generateJwt(realGoogleUser);

            res.setHeader('Set-Cookie', [
              `dhanvikk_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
            ]);

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Google login successful',
              user: realGoogleUser,
              token,
            }));
          }

          // GET /api/admin/staff
          if (url.startsWith('/api/admin/staff') && req.method === 'GET') {
            const staffList = DEMO_USERS.filter((u) => u.role !== 'customer').map((u) => ({
              id: u.id,
              staffId: u.staffId || `STF-${u.id.slice(-4)}`,
              name: u.name,
              email: u.email,
              role: u.role,
              roleTitle:
                u.role === 'super_admin'
                  ? 'Super Admin & Co-Founder'
                  : u.role === 'inventory_manager'
                  ? 'Master Florist & Inventory'
                  : u.role === 'delivery_manager'
                  ? 'Cold-Chain Dispatch Coordinator'
                  : 'Store Administrator',
              phone: u.phone,
              status: 'Active',
              avatar: u.avatar,
              isSuperAdmin: u.role === 'super_admin' || u.email === 'divagar.m.msc.cs@gmail.com',
              joinedDate: '2026-01-01',
            }));

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              count: staffList.length,
              superAdminEmail: 'divagar.m.msc.cs@gmail.com',
              staff: staffList,
            }));
          }

          // POST /api/admin/staff
          if (url.startsWith('/api/admin/staff') && req.method === 'POST') {
            const body = await getBody();
            const { name, email, role, phone, roleTitle, staffId, password } = body;
            const cleanEmail = (email || '').trim().toLowerCase();
            const assignedStaffId = staffId || `STF-2026-${Date.now().toString().slice(-4)}`;
            const plainPass = password || 'Staff@2026';

            const newStaffUser = {
              id: `staff_${Date.now()}`,
              staffId: assignedStaffId,
              name: name || 'Staff Member',
              email: cleanEmail,
              passwordHash: hashPassword(plainPass),
              role: role || 'admin',
              roleTitle: roleTitle || 'Store Staff',
              phone: phone || '',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              status: 'Active',
              isSuperAdmin: cleanEmail === 'divagar.m.msc.cs@gmail.com',
              joinedDate: new Date().toISOString().split('T')[0],
            };

            DEMO_USERS.push(newStaffUser);

            res.statusCode = 201;
            return res.end(JSON.stringify({
              success: true,
              message: `Staff member ${name} (${assignedStaffId}) created successfully!`,
              staff: newStaffUser,
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
