#!/bin/bash

echo "Updating Vercel environment variables for Supabase migration..."

# First, let's check current variables
echo "Current environment variables:"
vercel env ls

echo -e "\nRemoving old NextAuth variables..."
# Remove from each environment separately
vercel env rm NEXTAUTH_URL production || true
vercel env rm NEXTAUTH_URL preview || true
vercel env rm NEXTAUTH_URL development || true

vercel env rm NEXTAUTH_SECRET production || true
vercel env rm NEXTAUTH_SECRET preview || true
vercel env rm NEXTAUTH_SECRET development || true

echo -e "\nAdding Supabase environment variables..."

# Add to production
echo "Adding to production..."
echo "https://ixcsflqtipcfscbloahx.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTExMzIsImV4cCI6MjA2OTIyNzEzMn0.HHdm2m1dWdFkBWkT_tr2v-cZS545SrC3mTkv-g2Ckzs" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MTEzMiwiZXhwIjoyMDY5MjI3MTMyfQ.xbOSBM2L7HyCapEHRTvgUb9Ci6rG4CMrhqi6IOKXijs" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Add to preview
echo "Adding to preview..."
echo "https://ixcsflqtipcfscbloahx.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTExMzIsImV4cCI6MjA2OTIyNzEzMn0.HHdm2m1dWdFkBWkT_tr2v-cZS545SrC3mTkv-g2Ckzs" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MTEzMiwiZXhwIjoyMDY5MjI3MTMyfQ.xbOSBM2L7HyCapEHRTvgUb9Ci6rG4CMrhqi6IOKXijs" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview

# Add to development
echo "Adding to development..."
echo "https://ixcsflqtipcfscbloahx.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL development
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTExMzIsImV4cCI6MjA2OTIyNzEzMn0.HHdm2m1dWdFkBWkT_tr2v-cZS545SrC3mTkv-g2Ckzs" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MTEzMiwiZXhwIjoyMDY5MjI3MTMyfQ.xbOSBM2L7HyCapEHRTvgUb9Ci6rG4CMrhqi6IOKXijs" | vercel env add SUPABASE_SERVICE_ROLE_KEY development

echo -e "\nEnvironment variables update complete!"
echo -e "\nFinal environment variables:"
vercel env ls

echo -e "\nNote: You may need to redeploy for changes to take effect:"
echo "  - Production: vercel --prod"
echo "  - Preview: git push to trigger deployment"