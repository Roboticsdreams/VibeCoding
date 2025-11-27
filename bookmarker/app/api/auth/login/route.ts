import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginUser, LoginCredentials } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as LoginCredentials;
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Attempt login
    const user = await loginUser({ email, password });
    
    // Set a simple cookie for demonstration - in a real app we'd use proper session management
    cookies().set("auth-session", JSON.stringify({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // Return success response with user (excluding password)
    return NextResponse.json({ 
      user, 
      message: "Login successful" 
    });
    
  } catch (error) {
    console.error("Login error:", error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to login" },
      { status: 401 }
    );
  }
}
