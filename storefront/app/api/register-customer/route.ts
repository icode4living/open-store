import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Customer } from "@/types/customer";
import { signIn } from 'next-auth/react';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Ensure the stringified body used for the signature is the EXACT same string sent in the body
    const bodyString = JSON.stringify(body);

    const adminKey = process.env.STORE_SIGNING_KEY!;
    const secretBytes = Buffer.from(adminKey, "hex");

    const signature = crypto
      .createHmac("sha256", secretBytes)
      .update(bodyString)
      .digest("hex");

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/customers/register`;

    // 1. Native Fetch Implementation
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-Store-Identity": process.env.API_KEY || "",
        "X-Store-Signature": signature,
        // Forwarding cookies manually for session persistence
        "Cookie": req.headers.get("cookie") || "",
      },
      body: bodyString,
    });

    // Parse the JSON response
    const responseData = await res.json();

    // 2. Handle non-200 responses (like your 403 or 409)
    if (!res.ok) {
      return NextResponse.json(
        { error: responseData.message || "Backend request failed" },
        { status: res.status }
      );
    }

    const customer = responseData as Customer;

    // 3. NextAuth Logic
    if (customer && customer.id) {
     /* const result = await signIn('credentials', { 
        email: body.email, 
        password: body.password, 
        redirect: false 
      });

      if (result?.error) {
         return NextResponse.json({ error: "Auth failed after registration" }, { status: 401 });
      }*/

      return NextResponse.json(customer, { status: 201 });
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 400 });

  } catch (error: any) {
    console.error("[REGISTER ERROR]:", error.message);

    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}