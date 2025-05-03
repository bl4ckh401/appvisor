import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check if the user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For security, you might want to check if the user is an admin
    // This is a simplified example - in production, implement proper role checks
    const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    // In a real app, you'd check for admin role
    // if (!userProfile || !userProfile.is_admin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    // SQL to create the error logs table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS api_error_logs (
        id SERIAL PRIMARY KEY,
        api_name VARCHAR(255) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        status_code INTEGER,
        error_message TEXT NOT NULL,
        error_code VARCHAR(255),
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        request_id VARCHAR(255),
        user_id UUID REFERENCES auth.users(id),
        request_payload JSONB,
        raw_error TEXT
      );

      -- Create index on timestamp for efficient queries
      CREATE INDEX IF NOT EXISTS idx_api_error_logs_timestamp ON api_error_logs(timestamp DESC);

      -- Create index on api_name for filtering by API
      CREATE INDEX IF NOT EXISTS idx_api_error_logs_api_name ON api_error_logs(api_name);

      -- Create index on user_id for filtering by user
      CREATE INDEX IF NOT EXISTS idx_api_error_logs_user_id ON api_error_logs(user_id);
    `

    // Execute the SQL
    const { error } = await supabase.rpc("pgcrypto_execute", { query: createTableSQL })

    if (error) {
      console.error("Error creating error logs table:", error)

      // Try an alternative approach if the RPC method fails
      try {
        // This requires that your service role has permission to create tables
        const { error: sqlError } = await supabase.auth.admin.executeRawSql(createTableSQL)

        if (sqlError) {
          throw sqlError
        }
      } catch (altError) {
        console.error("Alternative approach also failed:", altError)
        return NextResponse.json(
          {
            error: "Failed to create error logs table",
            details: error,
            message: "Please run the SQL manually in your Supabase SQL editor",
          },
          { status: 500 },
        )
      }
    }

    // Update the database types to include the new table
    // This would typically be done manually or via a separate process

    return NextResponse.json({ success: true, message: "Error logging table created successfully" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error,
        message: "Please run the SQL manually in your Supabase SQL editor",
      },
      { status: 500 },
    )
  }
}
