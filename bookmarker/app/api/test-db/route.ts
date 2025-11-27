import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Try to connect to the database
    await db.$connect();
    console.log("Database connection successful!");
    
    // Count the number of users (a simple query to test database access)
    const userCount = await db.user.count();
    console.log(`Found ${userCount} users in the database.`);
    
    return NextResponse.json({ 
      status: "success", 
      message: "Database connection successful", 
      userCount 
    });
    
  } catch (error) {
    console.error("Database connection error:", error);
    
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to connect to database",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
