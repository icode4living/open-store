import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverClient } from "@/lib/api";
import { Order } from "@/types/order";

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
    const backendResponse = await serverClient.post<Order>(
      "/orders/checkout",
      {
        data: body,
        headers: {
          "Content-Type": "application/json",
          "X-Store-Identity": process.env.API_KEY || "",
          "X-Store-Signature": signature,
          // Forward incoming cookies (auth/session)
          Cookie: req.headers.get("cookie") || "",
        },
        // Important if using fetch/axios wrapper
        withCredentials: true,
      }
    );

    // 4. Create Next.js response
    const res = NextResponse.json(backendResponse)

    // 5. Forward Set-Cookie from backend → browser
  

    return res;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Checkout failed",
        details: error?.response?.data || error.message,
      },
      { status: error?.response?.status || 500 }
    );
  }
}