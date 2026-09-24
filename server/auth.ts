import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { UserRole } from './types';

// JWT secret from environment or dynamically initialized
const JWT_SECRET = process.env.JWT_SECRET || 'clinic_auth_jwt_key_secure_session_token';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

// In-memory rate limiting for login attempts
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const loginRateLimitMap = new Map<string, RateLimitEntry>();
const submissionRateLimitMap = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterMinutes?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    loginRateLimitMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return { allowed: true };
  }

  if (entry.count >= 5) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
    return { allowed: false, retryAfterMinutes: minutesLeft };
  }

  entry.count += 1;
  return { allowed: true };
}

export function resetLoginRateLimit(ip: string): void {
  loginRateLimitMap.delete(ip);
}

export function checkSubmissionRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = submissionRateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    submissionRateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return { allowed: true };
  }

  if (entry.count >= 8) {
    return { allowed: false };
  }

  entry.count += 1;
  return { allowed: true };
}

// Password hashing and comparison with bcrypt
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  try {
    // If it's a bcrypt hash
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return bcrypt.compareSync(password, hash);
    }
    // Fallback for legacy sha256 hashes during migration
    const legacySha = crypto.createHash('sha256').update(password + '_dr_baset_salt_2026').digest('hex');
    if (legacySha === hash) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

// Generate signed token (JWT HMAC-SHA256)
export function signToken(user: { id: string; email: string; name: string; role: UserRole }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string; name: string; role: UserRole } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

// Authentication middleware
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'يرجى تسجيل الدخول للوصول إلى لوحة التحكم' });
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: 'جلسة تسجيل الدخول منتهية أو غير صالحة' });
  }

  // Check if user is still active in database
  const dbUser = db.get().users.find((u) => u.id === user.id);
  if (!dbUser || !dbUser.isActive) {
    return res.status(403).json({ error: 'تم تعطيل هذا الحساب أو أنه لم يعد موجودًا' });
  }

  req.user = user;
  next();
}

// Role Authorization middleware
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    if (req.user.role === 'super_admin') {
      return next(); // Super admin always passes
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'عفوًا، ليس لديك الصلاحية الكافية للقيام بهذا الإجراء',
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
}
