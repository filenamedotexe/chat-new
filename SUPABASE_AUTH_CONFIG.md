# Supabase Auth Configuration

## Dashboard Settings Required (Manual Configuration)

Go to: https://supabase.com/dashboard/project/ixcsflqtipcfscbloahx/auth/settings

### Auth Settings:
1. **Enable email auth**: ✅ (should be enabled by default)
2. **Disable email confirmation**: Set "Enable email confirmations" to OFF (for development)
3. **Set Site URL**: `http://localhost:3000`
4. **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

### Password Requirements:
- Minimum length: 8 characters
- Require uppercase: No (for development ease)
- Require lowercase: No  
- Require numbers: No
- Require special characters: No

### JWT Settings:
- JWT expiry: 3600 (1 hour)
- Refresh token expiry: 604800 (7 days)

## Auth Flow:
1. User signs in with email/password
2. Supabase Auth creates session
3. User redirected to /dashboard
4. Session persisted in cookies via SSR helpers

## Environment Variables (Already Set):
- `NEXT_PUBLIC_SUPABASE_URL`: https://ixcsflqtipcfscbloahx.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [Already configured]
- `SUPABASE_SERVICE_ROLE_KEY`: [Already configured]