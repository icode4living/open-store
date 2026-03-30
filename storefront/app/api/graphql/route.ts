import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bodyString = JSON.stringify(body);

    // 1. Secret
    const adminKey = process.env.STORE_SIGNING_KEY!;
    const secretBytes = Buffer.from(adminKey, "hex");

    // 2. Generate HMAC
    const signature = crypto
      .createHmac("sha256", secretBytes)
      .update(bodyString)
      .digest("hex");

    // 3. Forward request to backend
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Store-Identity": process.env.API_KEY || "",
          "X-Store-Signature": signature,
          // Forward incoming cookies
          Cookie: req.headers.get("cookie") || "",
        },
        body: bodyString,
        credentials: "include", // important
      }
    );

    const data = await backendRes.json();

    // 4. Create response
    const res = NextResponse.json(data, {
      status: backendRes.status,
    });

    // 5. Forward Set-Cookie headers (CRITICAL)
    const setCookie = backendRes.headers.get("set-cookie");

    if (setCookie) {
      // fetch merges multiple cookies into a single string sometimes
      // safest approach: append as-is
      res.headers.append("Set-Cookie", setCookie);
    }

    return res;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Request failed",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}