import { useState } from "react";
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

const FAQ = [
  {
    q: "How do guests upload photos?",
    a: "Share your event QR code or link. Guests scan it, open the event page and upload photos or videos straight from their phone — no app or account needed.",
  },
  {
    q: "Who can see my event gallery?",
    a: "Anyone with your event link or QR code can view and add media. Only you, the event owner, can edit the event or delete media.",
  },
  {
    q: "Can I download everything at once?",
    a: "Yes. Long-press any photo or video in the gallery to enter selection mode, tap select all, then save or share them together.",
  },
  {
    q: "Is there a limit on uploads?",
    a: "There's no upload count limit. Videos can be recorded up to 30 minutes each.",
  },
  {
    q: "How do I install the app?",
    a: "Open Momentique in your phone browser and choose 'Add to Home Screen'. It then runs full screen like a native app.",
  },
];

const SOCIALS = [
  { label: "Instagram", Icon: Instagram, url: "https://instagram.com" },
  { label: "Facebook", Icon: Facebook, url: "https://facebook.com" },
  { label: "LinkedIn", Icon: Linkedin, url: "https://linkedin.com" },
  { label: "Website", Icon: Globe, url: "https://vionevents.com" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
];

interface SettingsPanelProps {
  email?: string | null;
  onSignOut: () => void;
}

const SettingsPanel = ({ email, onSignOut }: SettingsPanelProps) => {
  const [lang, setLang] = useState(() => localStorage.getItem("mv_lang") || "en");

  const pickLang = (code: string) => {
    setLang(code);
    localStorage.setItem("mv_lang", code);
    toast.success(code === "en" ? "Language set to English" : "ቋንቋ ወደ አማርኛ ተቀይሯል");
  };

  const clearCache = async () => {
    try {
      const keep = Object.keys(localStorage).filter((k) => k.startsWith("sb-"));
      const saved = keep.map((k) => [k, localStorage.getItem(k)] as const);
      localStorage.clear();
      saved.forEach(([k, v]) => v && localStorage.setItem(k, v));
      sessionStorage.clear();
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      toast.success("Cache cleared");
    } catch {
      toast.error("Could not clear the cache");
    }
  };

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-display font-bold text-foreground">Settings</h2>

      {email && (
        <div className="p-3.5 rounded-2xl bg-card border border-border">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">
            Signed in as
          </p>
          <p className="font-body text-sm text-foreground truncate">{email}</p>
        </div>
      )}

      {/* FAQ */}
      <div className="rounded-2xl bg-card border border-border px-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="faq" className="border-none">
            <AccordionTrigger className="font-display text-sm">FAQ</AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible className="space-y-1">
                {FAQ.map((f, i) => (
                  <AccordionItem key={i} value={`q${i}`} className="border-border">
                    <AccordionTrigger className="text-left text-xs font-body">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground font-body leading-relaxed">
                      {f.a}
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
        <p className="font-display font-semibold text-sm text-foreground mb-3">Contact us</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="gold"
            className="gap-2 text-xs h-11 rounded-xl"
            onClick={() => (window.location.href = "mailto:eventcoordinator@vionevents.com")}
          >
            <Mail className="w-4 h-4" /> Email us
          </Button>
          <Button
            variant="gold-outline"
            className="gap-2 text-xs h-11 rounded-xl"
            onClick={() => (window.location.href = "tel:+251944010908")}
          >
            <Phone className="w-4 h-4" /> Call us
          </Button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <p className="font-display font-semibold text-sm text-foreground mb-3">Language</p>
        <div className="flex gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => pickLang(l.code)}
              className={`px-4 h-10 rounded-xl text-xs font-body border transition-colors ${
                lang === l.code
                  ? "gold-gradient text-primary-foreground border-transparent"
                  : "bg-background text-foreground border-border"
              }`}
            >
              {l.label}
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
                <Shield className="w-4 h-4 text-gold" /> Privacy
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground font-body leading-relaxed space-y-2">
              <p>
                Momentique stores only what your event needs: event details and the photos and
                videos uploaded to it. Media is kept in secure cloud storage tied to your event.
              </p>
              <p>
                We never sell your data or share it with third parties. Deleting an event removes
                its gallery. Guests are not required to create an account.
              </p>
              <p>
                Questions about your data? Email eventcoordinator@vionevents.com and we'll respond.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Socials */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <p className="font-display font-semibold text-sm text-foreground mb-3">Follow us</p>
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
          <Trash2 className="w-4 h-4" /> Clear cache
        </Button>
        <Button
          variant="ghost"
          className="w-full h-11 rounded-xl gap-2 font-body text-destructive"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground font-body pt-2">
        Powered by <span className="font-semibold">VION Events</span>
      </p>
    </section>
  );
};

export default SettingsPanel;
