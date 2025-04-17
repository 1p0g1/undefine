#!/bin/bash

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set"
  exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Error: supabase CLI is not installed. Please install it first:"
  echo "npm install -g supabase-cli"
  exit 1
fi

echo "=== Running Supabase Migrations ==="

# Initialize Supabase if not already initialized
if [ ! -d "supabase" ]; then
  echo "Initializing Supabase project..."
  supabase init
fi

# Link to your Supabase project
echo "Linking to Supabase project..."
supabase link --project-ref $(echo $SUPABASE_URL | cut -d'.' -f1 | cut -d'/' -f3)

# Apply migrations
echo "Applying migrations..."
supabase db push

echo "✅ Migrations completed successfully" 