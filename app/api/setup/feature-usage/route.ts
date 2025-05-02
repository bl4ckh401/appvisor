import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First check if the table already exists
    const { error: checkError } = await supabase.from("feature_usage").select("id").limit(1)

    // If table exists, we're done
    if (!checkError) {
      return NextResponse.json({ success: true, message: "Table already exists" })
    }

    // If error is not "relation does not exist", return the error
    if (checkError.code !== "42P01" && !checkError.message?.includes("does not exist")) {
      return NextResponse.json(
        {
          error: "Error checking table existence",
          details: checkError,
        },
        { status: 500 },
      )
    }

    // Table doesn't exist, create it using direct SQL
    // We'll use multiple simple queries instead of one complex query
    // to increase chances of success

    // Create the table
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.feature_usage (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          feature TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 1,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
          metadata JSONB
        );
      `,
    })

    if (createError) {
      console.error("Error creating feature_usage table:", createError)
      return NextResponse.json(
        {
          error: "Failed to create feature_usage table",
          details: createError,
        },
        { status: 500 },
      )
    }

    // Create indexes
    await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON public.feature_usage(user_id);
        CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON public.feature_usage(feature);
        CREATE INDEX IF NOT EXISTS idx_feature_usage_timestamp ON public.feature_usage(timestamp);
      `,
    })

    // Enable RLS
    await supabase.rpc("exec_sql", {
      sql_query: `ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;`,
    })

    // Create policies
    await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE POLICY "Users can view their own usage"
          ON public.feature_usage FOR SELECT
          USING (auth.uid() = user_id);
      `,
    })

    await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE POLICY "Users can insert their own usage"
          ON public.feature_usage FOR INSERT
          WITH CHECK (auth.uid() = user_id);
      `,
    })

    await supabase.rpc("exec_sql", {
      sql_query: `
        CREATE POLICY "Service role can manage all usage"
          ON public.feature_usage
          USING (auth.role() = 'service_role');
      `,
    })

    return NextResponse.json({ success: true, message: "Table created successfully" })
  } catch (error) {
    console.error("Error in feature_usage setup:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
