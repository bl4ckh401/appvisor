-- Create a function to create the feature_usage table
CREATE OR REPLACE FUNCTION create_feature_usage_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'feature_usage'
  ) THEN
    RETURN true;
  END IF;

  -- Create the feature_usage table
  CREATE TABLE IF NOT EXISTS public.feature_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    feature TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB
  );
  
  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON public.feature_usage(user_id);
  CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON public.feature_usage(feature);
  CREATE INDEX IF NOT EXISTS idx_feature_usage_timestamp ON public.feature_usage(timestamp);
  
  -- Enable RLS
  ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  DO $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can view their own usage" ON public.feature_usage;
  DROP POLICY IF EXISTS "Users can insert their own usage" ON public.feature_usage;
  DROP POLICY IF EXISTS "Service role can manage all usage" ON public.feature_usage;
  
  -- Create new policies
  CREATE POLICY "Users can view their own usage"
    ON public.feature_usage FOR SELECT
    USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert their own usage"
    ON public.feature_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Service role can manage all usage"
    ON public.feature_usage
    USING (auth.role() = 'service_role');
EXCEPTION
  WHEN others THEN
    -- Ignore errors from policy creation
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;
    
  RETURN true;
END;
$$;
