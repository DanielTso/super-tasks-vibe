"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyPassword, checkPasswordStrength } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
  clearSession,
  getCurrentUser,
} from "@/lib/auth/session";
import type { User, ActionResult } from "@/lib/types";

// Validation schemas
const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Register a new user
 */
export async function registerUser(
  input: z.infer<typeof RegisterSchema>
): Promise<ActionResult<User>> {
  // Validate input
  const result = RegisterSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { username, email, password } = result.data;

  // Check password strength
  const strengthCheck = checkPasswordStrength(password);
  if (!strengthCheck.isValid) {
    return { error: strengthCheck.errors[0] };
  }

  try {
    // Check if username already exists
    const existingUsername = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [username],
    });
    if (existingUsername.rows.length > 0) {
      return { error: "Username already taken" };
    }

    // Check if email already exists
    const existingEmail = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });
    if (existingEmail.rows.length > 0) {
      return { error: "Email already registered" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, username, display_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [userId, email, passwordHash, username, username],
    });

    // Fetch created user
    const userResult = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [userId],
    });

    const row = userResult.rows[0] as Record<string, unknown>;
    const user: User = {
      id: row.id as string,
      email: row.email as string,
      username: row.username as string,
      displayName: row.display_name as string | null,
      avatarUrl: row.avatar_url as string | null,
      isActive: (row.is_active as number) === 1,
      emailVerified: (row.email_verified as number) === 1,
      lastLoginAt: row.last_login_at as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };

    revalidatePath("/");
    return { data: user };
  } catch (error) {
    console.error("[registerUser]", error);
    return { error: "Failed to create account" };
  }
}

/**
 * Login a user
 */
export async function loginUser(
  input: z.infer<typeof LoginSchema>
): Promise<ActionResult<User>> {
  // Validate input
  const result = LoginSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { username, password } = result.data;

  try {
    // Find user by username or email
    const userResult = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? OR email = ?",
      args: [username, username],
    });

    if (userResult.rows.length === 0) {
      return { error: "Invalid credentials" };
    }

    const row = userResult.rows[0] as Record<string, unknown>;
    const passwordHash = row.password_hash as string;

    // Verify password
    const isValid = await verifyPassword(password, passwordHash);
    if (!isValid) {
      return { error: "Invalid credentials" };
    }

    // Check if user is active
    if ((row.is_active as number) !== 1) {
      return { error: "Account is disabled" };
    }

    // Update last login
    await db.execute({
      sql: "UPDATE users SET last_login_at = datetime('now') WHERE id = ?",
      args: [row.id as string],
    });

    // Create session
    const user: User = {
      id: row.id as string,
      email: row.email as string,
      username: row.username as string,
      displayName: row.display_name as string | null,
      avatarUrl: row.avatar_url as string | null,
      isActive: (row.is_active as number) === 1,
      emailVerified: (row.email_verified as number) === 1,
      lastLoginAt: new Date().toISOString(),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };

    const sessionToken = await createSessionToken(user);
    await setSessionCookie(sessionToken);

    revalidatePath("/");
    return { data: user };
  } catch (error) {
    console.error("[loginUser]", error);
    return { error: "Authentication failed" };
  }
}

/**
 * Logout a user
 */
export async function logoutUser(): Promise<ActionResult<void>> {
  try {
    await clearSession();
    revalidatePath("/");
    return { data: undefined };
  } catch (error) {
    console.error("[logoutUser]", error);
    return { error: "Logout failed" };
  }
}

/**
 * Get current authenticated user
 */
export async function getAuthUser(): Promise<ActionResult<User>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Not authenticated" };
    }
    return { data: user };
  } catch (error) {
    console.error("[getAuthUser]", error);
    return { error: "Failed to get user" };
  }
}
