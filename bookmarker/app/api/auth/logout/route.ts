import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logoutUser } from "@/lib/auth/utils";

export async function POST() {
  try {
    await logoutUser();
    
    // Clear the auth cookie
    cookies().delete("auth-session");

    return NextResponse.json({ 
      message: "Logged out successfully" 
    });
    
  } catch (error) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
