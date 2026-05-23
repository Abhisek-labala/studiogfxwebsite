import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'studiogfx_neon_glow_secret_key_2026';
const TOKEN_COOKIE_NAME = 'studiogfx_session';

export const auth = {
  /**
   * Hashes a plain-text password synchronously.
   */
  hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },

  /**
   * Compares a plain-text password with a hash.
   */
  comparePassword(password, hash) {
    try {
      return bcrypt.compareSync(password, hash);
    } catch (err) {
      console.error('Password comparison failed:', err);
      return false;
    }
  },

  /**
   * Signs a JWT payload for admin session.
   */
  signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  },

  /**
   * Verifies a JWT token. Returns payload or null.
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  },

  /**
   * Auth verification helper for App Router API routes.
   * Checks the HttpOnly cookie for a valid token.
   * Returns payload if authenticated, else null.
   */
  async verifySession() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(TOKEN_COOKIE_NAME);
    if (!cookie) return null;

    const payload = this.verifyToken(cookie.value);
    if (!payload) return null;

    return payload;
  },

  /**
   * Sets the HttpOnly session cookie on a response header.
   */
  async setSessionCookie(token) {
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
  },

  /**
   * Clears the HttpOnly session cookie.
   */
  async clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_COOKIE_NAME);
  }
};
