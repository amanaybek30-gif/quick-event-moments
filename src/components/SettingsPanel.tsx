import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  Shield,
  Trash2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES, useI18n, type Lang, type TranslationKey } from "@/i18n";

const FAQ_KEYS: [TranslationKey, TranslationKey][] = [
  ["faq1q", "faq1a"],
  ["faq2q", "faq2a"],
  ["faq3q", "faq3a"],
  ["faq4q", "faq4a"],
  ["faq5q", "faq5a"],
];

const SOCIALS = [
  { label: "Instagram", Icon: Instagram, url: "https://instagram.com" },
  { label: "Facebook", Icon: Facebook, url: "https://facebook.com" },
  { label: "LinkedIn", Icon: Linkedin, url: "https://linkedin.com" },
  { label: "Website", Icon: Globe, url: "https://vionevents.com" },
];

interface SettingsPanelProps {
  email?: string | null;
  onSignOut: () => void;
}

const SettingsPanel = ({ email, onSignOut }: SettingsPanelProps) => {
  const { lang, setLang, t } = useI18n();

  const pickLang = (code: Lang) => {
    setLang(code);
    toast.success(LANGUAGES.find((l) => l.code === code)?.label ?? "");
  };

  const clearCache = async () => {
    try {
      const keep = Object.keys(localStorage).filter(
        (k) => k.startsWith("sb-") || k === "mv_lang",
      );
      const saved = keep.map((k) => [k, localStorage.getItem(k)] as const);
      localStorage.clear();
      saved.forEach(([k, v]) => v && localStorage.setItem(k, v));
      sessionStorage.clear();
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      toast.success(t("cacheCleared"));
    } catch {
      toast.error(t("cacheClearFailed"));
    }
  };

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-display font-bold text-foreground">{t("settings")}</h2>

      {email && (
        <div className="p-3.5 rounded-2xl bg-card border border-border">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">
            {t("signedInAs")}
          </p>
          <p className="font-body text-sm text-foreground truncate">{email}</p>
        </div>
      )}

      {/* FAQ */}
      <div className="rounded-2xl bg-card border border-border px-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="faq" className="border-none">
            <AccordionTrigger className="font-display text-sm">{t("faq")}</AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible className="space-y-1">
                {FAQ_KEYS.map(([q, a], i) => (
                  <AccordionItem key={i} value={`q${i}`} className="border-border">
                    <AccordionTrigger className="text-left text-xs font-body">
                      {t(q)}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground font-body leading-relaxed">
                      {t(a)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Contact */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <p className="font-display font-semibold text-sm text-foreground mb-3">{t("contactUs")}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="gold"
            className="gap-2 text-xs h-11 rounded-xl"
            onClick={() => (window.location.href = "mailto:eventcoordinator@vionevents.com")}
          >
            <Mail className="w-4 h-4" /> {t("emailUs")}
          </Button>
          <Button
            variant="gold-outline"
            className="gap-2 text-xs h-11 rounded-xl"
            onClick={() => (window.location.href = "tel:+251944010908")}
          >
            <Phone className="w-4 h-4" /> {t("callUs")}
          </Button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <p className="font-display font-semibold text-sm text-foreground mb-3">{t("language")}</p>
        <div className="grid grid-cols-4 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => pickLang(l.code)}
              aria-label={l.label}
              className={`h-11 rounded-xl text-sm font-body border transition-colors ${
                lang === l.code
                  ? "gold-gradient text-primary-foreground border-transparent"
                  : "bg-background text-foreground border-border"
              }`}
            >
              {l.initials}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-2xl bg-card border border-border px-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="privacy" className="border-none">
            <AccordionTrigger className="font-display text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold" /> {t("privacy")}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground font-body leading-relaxed space-y-2">
              <p>{t("privacy1")}</p>
              <p>{t("privacy2")}</p>
              <p>{t("privacy3")}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Socials */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <p className="font-display font-semibold text-sm text-foreground mb-3">{t("followUs")}</p>
        <div className="flex gap-3">
          {SOCIALS.map(({ label, Icon, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-11 h-11 rounded-full gold-gradient flex items-center justify-center text-primary-foreground active:scale-95 transition-transform"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full h-11 rounded-xl gap-2 font-body"
          onClick={clearCache}
        >
          <Trash2 className="w-4 h-4" /> {t("clearCache")}
        </Button>
        <Button
          variant="ghost"
          className="w-full h-11 rounded-xl gap-2 font-body text-destructive"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4" /> {t("signOut")}
        </Button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground font-body pt-2">
        {t("poweredBy")} <span className="font-semibold">VION Events</span>
      </p>
    </section>
  );
};

export default SettingsPanel;
