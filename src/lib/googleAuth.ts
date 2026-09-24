import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

const LIVE_APP_ORIGIN = "https://quick-event-moments.lovable.app";
const managedGoogleAuth = createLovableAuth({
  oauthBrokerUrl: `${LIVE_APP_ORIGIN}/~oauth/initiate`,
});

const isManagedAppOrigin = (origin: string) => {
  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith(".lovable.app")
      || hostname.endsWith(".lovableproject.com");
  } catch {
    return false;
  }
};

export const signInWithGoogle = async () => {
  const currentOrigin = window.location.origin;
  const redirectUri = isManagedAppOrigin(currentOrigin) ? currentOrigin : LIVE_APP_ORIGIN;
  const result = await managedGoogleAuth.signInWithOAuth("google", {
    redirect_uri: redirectUri,
    extraParams: { prompt: "select_account" },
  });

  if (result.redirected || result.error) return result;

  try {
    await supabase.auth.setSession(result.tokens);
    return result;
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
};