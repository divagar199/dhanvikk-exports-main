import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  loginWithEmailPassword,
  registerUser,
  loginWithFirebase,
  resolveUserRole,
} from '../src/services/auth.service.js';
import { generateToken, verifyToken } from '../src/config/jwt.js';
import { protect, authorize } from '../src/middleware/authMiddleware.js';
import { ApiError } from '../src/utils/apiError.js';

describe('Authentication & Security Audit Tests', () => {
  test('1. Valid email & password login issues a valid token and user profile', async () => {
    const result = await loginWithEmailPassword({
      email: 'customer@dhanvikk.com',
      password: 'Bloom@2026',
    });

    assert.ok(result.token, 'Token must be returned on valid login');
    assert.ok(result.user, 'User object must be returned');
    assert.equal(result.user.email, 'customer@dhanvikk.com');
    assert.equal(result.user.role, 'customer');

    // Verify token cryptographic signature and claims
    const decoded = verifyToken(result.token);
    assert.equal(decoded.email, 'customer@dhanvikk.com');
    assert.equal(decoded.role, 'customer');
  });

  test('2. Invalid password returns genuine HTTP 401 ApiError', async () => {
    await assert.rejects(
      async () => {
        await loginWithEmailPassword({
          email: 'customer@dhanvikk.com',
          password: 'WrongPassword!999',
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /incorrect password/i);
        return true;
      }
    );
  });

  test('3. Unknown user email returns HTTP 404 ApiError', async () => {
    await assert.rejects(
      async () => {
        await loginWithEmailPassword({
          email: 'nonexistent_random_user_99@dhanvikk.com',
          password: 'SomePassword123!',
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 404);
        return true;
      }
    );
  });

  test('4. Duplicate registration with existing email is rejected with HTTP 409', async () => {
    await assert.rejects(
      async () => {
        await registerUser({
          name: 'Imposter Customer',
          email: 'customer@dhanvikk.com',
          password: 'SecurePassword123!',
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /already exists/i);
        return true;
      }
    );
  });

  test('5. JWT verification rejects malformed or tampered tokens', () => {
    assert.throws(() => {
      verifyToken('invalid.token.payload');
    });

    const validToken = generateToken({
      id: 'usr_test_123',
      email: 'test@dhanvikk.com',
      role: 'customer',
    });

    const tamperedToken = validToken.slice(0, -6) + 'ABCDEF';
    assert.throws(() => {
      verifyToken(tamperedToken);
    });
  });

  test('6. protect middleware strictly returns HTTP 401 when token is missing', async () => {
    const req = { headers: {}, cookies: {} };
    let responseStatus = null;
    let responseBody = null;
    let nextCalled = false;

    const res = {
      status(code) {
        responseStatus = code;
        return {
          json(body) {
            responseBody = body;
          },
        };
      },
    };

    const next = () => {
      nextCalled = true;
    };

    await protect(req, res, next);
    assert.equal(nextCalled, false, 'next() must NOT be called on unauthenticated request');
    assert.equal(responseStatus, 401, 'Must reject with HTTP 401');
    assert.equal(responseBody.success, false);
    assert.match(responseBody.message, /Authentication required/i);
  });

  test('7. protect middleware strictly returns HTTP 401 on expired or invalid token', async () => {
    const req = {
      headers: { authorization: 'Bearer forged.invalid.jwt.token' },
      cookies: {},
    };
    let responseStatus = null;
    let responseBody = null;
    let nextCalled = false;

    const res = {
      status(code) {
        responseStatus = code;
        return {
          json(body) {
            responseBody = body;
          },
        };
      },
    };

    const next = () => {
      nextCalled = true;
    };

    await protect(req, res, next);
    assert.equal(nextCalled, false);
    assert.equal(responseStatus, 401);
    assert.equal(responseBody.success, false);
    assert.match(responseBody.message, /Invalid or expired/i);
  });

  test('8. authorize middleware strictly returns HTTP 403 when customer attempts staff/admin access', () => {
    const req = {
      user: {
        id: 'usr_cust_001',
        email: 'customer@dhanvikk.com',
        role: 'customer',
      },
    };
    let responseStatus = null;
    let responseBody = null;
    let nextCalled = false;

    const res = {
      status(code) {
        responseStatus = code;
        return {
          json(body) {
            responseBody = body;
          },
        };
      },
    };

    const next = () => {
      nextCalled = true;
    };

    const adminOnly = authorize('admin', 'manager');
    adminOnly(req, res, next);

    assert.equal(nextCalled, false, 'Customer must not be granted admin access');
    assert.equal(responseStatus, 403, 'Must return HTTP 403 Forbidden');
    assert.equal(responseBody.success, false);
  });

  test('9. resolveUserRole defaults new registrations to customer role', () => {
    assert.equal(resolveUserRole('newbuyer@gmail.com'), 'customer');
    assert.equal(resolveUserRole('hacker_admin@yahoo.com'), 'customer');
  });

  test('10. loginWithFirebase rejects missing email with HTTP 401', async () => {
    await assert.rejects(
      async () => {
        await loginWithFirebase({
          idToken: '',
          email: '',
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 401);
        return true;
      }
    );
  });
});
