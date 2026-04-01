import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverClient } from "@/lib/api";
import { Order } from "@/types/order";
import { Customer } from "@/types/customer";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const bodyString = JSON.stringify(body); // Minified by default

  // 1. Get the Secret (Only available on the server)
  const adminKey = process.env.STORE_SIGNING_KEY!;
  const secretBytes = Buffer.from(adminKey, "hex");

  // 2. Generate HMAC
  const signature = crypto
    .createHmac("sha256", secretBytes)
    .update(bodyString)
    .digest("hex");

  // 3. Forward to Go Backend
  const response = await serverClient.post<Customer>(
    "/customers/register",
    body,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Store-Identity": process.env.API_KEY || "",
        "X-Store-Signature": signature,
        // Forward cookies/auth from the browser
        Cookie: req.headers.get("cookie") || "",
      },
      withCredentials: true,
    }
  );

  //const data = await response;
  return NextResponse.json(response);
}