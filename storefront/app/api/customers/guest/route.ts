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

    // 3. Forward request to Go backend
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customers/guest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Store-Identity": process.env.API_KEY || "",
          "X-Store-Signature": signature,
          Cookie: req.headers.get("cookie") || "",
        },
        body: bodyString,
        credentials: "include",
      }
    );

    const data = await backendResponse.json();

    // 4. Create Next.js response
    const res = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // 5. Forward Set-Cookie from backend → browser
    const setCookie = backendResponse.headers.get("set-cookie");

    if (setCookie) {
      res.headers.append("Set-Cookie", setCookie);
    }

    return res;
  } catch (error: any) {
    console.log("[Guest Error ]", error?.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Guest Checkout failed",
        details: error?.response?.data || error.message,
      },
      { status: error?.response?.status || 500 }
    );
  }
}