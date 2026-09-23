import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  validateCredentials,
} from "@/lib/auth";
import { SESSION_COOKIE, DEMO_USER } from "@/lib/constants";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const username = body.username ?? "";
  const password = body.password ?? "";

  if (!validateCredentials(username, password)) {
    return NextResponse.json(
      { error: "Identifiants incorrects" },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const res = NextResponse.json({
    ok: true,
    user: {
      email: DEMO_USER.username,
      name: DEMO_USER.displayName,
      company: DEMO_USER.company,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
