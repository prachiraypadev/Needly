import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destUrl = new URL("/join-community", request.nextUrl.origin);
  if (code) {
    destUrl.searchParams.set("code", code);
  }
  return NextResponse.redirect(destUrl);
}
