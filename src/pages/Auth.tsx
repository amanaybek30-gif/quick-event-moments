import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QrScannerFab from "@/components/QrScannerFab";
import heroImage from "@/assets/hero-event.jpg";
import { useI18n } from "@/i18n";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(cleanEmail)) {
      toast.error(t("invalidEmail"));
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // Identities is empty when the email is already registered.
        if (data.user && data.user.identities?.length === 0) {
          throw new Error("This email is already registered. Please sign in.");
        }
        // No session until the user clicks the verification link in their inbox.
        toast.success(t("checkEmailConfirm"), { duration: 8000 });
        setMode("signin");
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) {
          if (/not confirmed/i.test(error.message)) throw new Error(t("checkEmailConfirm"));
          throw error;
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <img
        src={heroImage}
        alt="Guests capturing event moments"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/85 via-foreground/75 to-foreground/95" />

      <div className="relative z-10 flex flex-col min-h-[100dvh] px-5 pt-4 pb-8 max-w-md mx-auto w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-primary-foreground">
            Moment<span className="text-gold">ique</span>
          </h2>
          <QrScannerFab variant="inline" label={t("scanQr")} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col justify-center"
        >
          <h1 className="text-3xl font-display font-bold text-primary-foreground leading-tight mb-2">
            {mode === "signin" ? t("welcomeBack") : t("createAccount")}
          </h1>
          <p className="text-primary-foreground/70 font-body text-sm mb-7">
            {t("authSubtitle")}
          </p>

          <form onSubmit={handleEmail} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("emailAddress")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl font-body bg-background"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 rounded-xl font-body bg-background"
                minLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full h-12 rounded-xl gap-2"
              disabled={loading}
            >
              {loading ? t("pleaseWait") : mode === "signin" ? t("signIn") : t("signUp")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-sm text-primary-foreground/70 font-body underline-offset-4 hover:underline"
          >
            {mode === "signin" ? t("newHere") : t("haveAccount")}
          </button>
        </motion.div>

        <p className="text-center text-[11px] text-primary-foreground/50 font-body">
          {t("poweredBy")} <span className="font-semibold">VION Events</span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
