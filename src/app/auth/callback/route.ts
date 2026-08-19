import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
  const host = forwardedHost || request.headers.get('host');
  const protocol = host && host.includes('localhost') ? 'http' : 'https';
  const targetOrigin = host ? `${protocol}://${host}` : origin;
  
  // 1. Check if Supabase or Google returned an error during the OAuth process
  const oauthError = searchParams.get('error');
  const oauthErrorDesc = searchParams.get('error_description');
  if (oauthError || oauthErrorDesc) {
    const errorMsg = oauthErrorDesc || oauthError || 'Google Authentication failed';
    console.error('[Auth Callback] OAuth error returned from Supabase:', {
      error: oauthError,
      description: oauthErrorDesc
    });
    return NextResponse.redirect(`${targetOrigin}/sign-in?error=${encodeURIComponent(errorMsg)}`);
  }

  const code = searchParams.get('code');
  
  // if "next" is in param, use it as the redirect URL. Default to standard authenticated dashboard.
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a full valid Supabase session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${targetOrigin}${next}`);
    } else {
      console.error('[Auth Callback] Failed to exchange code for session:', error.message);
      return NextResponse.redirect(`${targetOrigin}/sign-in?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Redirect to sign in if code is missing entirely and no error param is present
  return NextResponse.redirect(`${targetOrigin}/sign-in?error=${encodeURIComponent('No authentication code provided')}`);
}
