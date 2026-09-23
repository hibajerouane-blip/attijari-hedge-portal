import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  DEMO_USER,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "./constants";

export interface SessionPayload {
  sub: string;
  name: string;
  company: string;
  iat?: number;
  exp?: number;
}

function getSecret(): Uint8Array {
  const raw =
    process.env.SESSION_SECRET ||
    "hedgedesk-demo-secret-change-me-in-prod-32b";
  return new TextEncoder().encode(raw);
}

export function validateCredentials(
  username: string,
  password: string
): boolean {
  return (
    username.trim().toLowerCase() === DEMO_USER.username.toLowerCase() &&
    password === DEMO_USER.password
  );
}

export async function createSessionToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    name: DEMO_USER.displayName,
    company: DEMO_USER.company,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(DEMO_USER.username)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_TTL_SECONDS)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      name: String(payload.name ?? ""),
      company: String(payload.company ?? ""),
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
