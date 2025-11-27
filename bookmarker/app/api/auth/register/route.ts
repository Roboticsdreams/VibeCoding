import { NextResponse } from "next/server";
import { registerUser, RegisterData } from "../../../../lib/auth/utils";

export async function POST(request: Request) {
  try {
    console.log("Registration attempt starting...");
    const body = await request.json();
    const { name, email, password } = body as RegisterData;
    
    console.log(`Registration attempt for email: ${email}`);
    
    // Basic validation
    if (!name || !email || !password) {
      console.log("Registration validation failed: Missing required fields");
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      console.log("Registration validation failed: Password too short");
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      console.log("Registration validation failed: Password strength requirements not met");
      return NextResponse.json(
        { 
          error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
        },
        { status: 400 }
      );
    }

    // Attempt to register the user
    console.log("Calling registerUser function...");
    const user = await registerUser({ name, email, password });
    console.log("User registered successfully:", { id: user.id, email: user.email });

    // Return success response with user (excluding password)
    return NextResponse.json({ 
      user, 
      message: "Registration successful" 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register" },
      { status: 400 }
    );
  }
}
