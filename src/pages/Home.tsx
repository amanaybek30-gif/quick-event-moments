import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarPlus,
  ChevronRight,
  Images,
  Lock,
  LogOut,
  MapPin,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import QrScannerFab from "@/components/QrScannerFab";
import SettingsPanel from "@/components/SettingsPanel";
import {
  EventData,
  claimEvent,
  fetchMyEvents,
  fetchUnclaimedEvents,
} from "@/lib/eventService";
import heroImage from "@/assets/hero-event.jpg";
import { verifyAdminPassword } from "@/lib/eventService";
import { useI18n } from "@/i18n";

type Tab = "create" | "events" | "settings";

const EventCard = ({
  event,
  locked,
  onClick,
}: {
  event: EventData;
  locked?: boolean;
  onClick: () => void;
}) => {
  const { t } = useI18n();
  return (
  <motion.button
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="w-full text-left rounded-2xl overflow-hidden bg-card border border-border active:scale-[0.99] transition-transform"
  >
    <div className="flex gap-3">
      <div className="w-24 h-24 shrink-0 bg-muted">
        {event.cover_image ? (
          <img
            src={event.cover_image}
            alt={`${event.name} cover`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Images className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-2.5 pr-3">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 font-display font-semibold text-foreground truncate">
            {event.name}
          </h3>
          {locked ? (
            <Lock className="w-3.5 h-3.5 text-muted-foreground mt-1 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-1">
          <Calendar className="w-3 h-3" /> {event.date}
        </p>
        {event.venue && (
          <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 shrink-0" /> {event.venue}
          </p>
        )}
        <p className="text-[11px] text-gold font-body font-medium mt-1">
          {event.uploads ?? 0} {t("uploads")}
        </p>
        {event.payment_status === "pending" && (
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">
            {t("awaitingPayment")}
          </p>
        )}
        {event.payment_status === "declined" && (
          <p className="text-[11px] text-destructive font-body mt-0.5">
            {t("paymentDeclined")}
          </p>
        )}
      </div>
    </div>
  </motion.button>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const [taps, setTaps] = useState(0);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  // Hidden admin entry: three quick taps on the Momentique logo.
  const tapLogo = () => {
    setTaps((n) => {
      const next = n + 1;
      if (next >= 3) {
        setAdminOpen(true);
        return 0;
      }
      window.setTimeout(() => setTaps(0), 900);
      return next;
    });
  };

  const submitAdmin = async () => {
    setAdminBusy(true);
    const ok = await verifyAdminPassword(adminPw);
    setAdminBusy(false);
    if (!ok) {
      toast.error(t("wrongAdminPassword"));
      return;
    }
    localStorage.setItem("mv_role", "admin");
    setAdminOpen(false);
    setAdminPw("");
    navigate("/admin");
  };
  const [tab, setTab] = useState<Tab>("create");
  const [mine, setMine] = useState<EventData[]>([]);
  const [unclaimed, setUnclaimed] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<EventData | null>(null);
  const [claimPw, setClaimPw] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [a, b] = await Promise.all([fetchMyEvents(user.id), fetchUnclaimedEvents()]);
    setMine(a);
    setUnclaimed(b);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleClaim = async () => {
    if (!claiming) return;
    setClaimBusy(true);
    const ok = await claimEvent(claiming.id, claimPw);
    setClaimBusy(false);
    if (!ok) {
      toast.error(t("incorrectPassword"));
      return;
    }
    const id = claiming.id;
    setClaiming(null);
    setClaimPw("");
    toast.success(t("eventAdded"));
    navigate(`/organizer/${id}`);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto w-full px-4 h-14 flex items-center justify-between">
          <h1
            onClick={tapLogo}
            className="text-lg font-display font-bold text-foreground select-none cursor-pointer"
          >
            Moment<span className="text-gold">ique</span>
          </h1>
          <QrScannerFab variant="inline" label={t("scanQr")} />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 pt-5">
        {tab === "create" && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src={heroImage}
                alt="Guests capturing moments at an event"
                className="w-full h-56 object-cover"
                width={1920}
                height={1080}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium gold-gradient text-primary-foreground mb-2">
                  <Sparkles className="w-3 h-3" /> {t("selfService")}
                </span>
                <h2 className="text-2xl font-display font-bold text-primary-foreground leading-tight">
                  {t("homeHeadline")}
                </h2>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full py-6 rounded-2xl gap-2 mt-4"
              onClick={() => navigate("/create")}
            >
              <Plus className="w-5 h-5" />
              {t("createNewEvent")}
            </Button>

            <div className="mt-6 space-y-3">
              {[
                { n: "1", t: t("step1Title"), d: t("step1Desc") },
                { n: "2", t: t("step2Title"), d: t("step2Desc") },
                { n: "3", t: t("step3Title"), d: t("step3Desc") },
              ].map((s) => (
                <div key={s.n} className="flex gap-3 p-3.5 rounded-2xl bg-card border border-border">
                  <div className="w-8 h-8 shrink-0 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                    {s.n}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground">{s.t}</p>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {tab === "events" && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <h2 className="text-xl font-display font-bold text-foreground">{t("myEvents")}</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground font-body py-6">{t("loadingEvents")}</p>
            ) : mine.length === 0 ? (
              <div className="text-center py-10">
                <CalendarPlus className="w-9 h-9 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body mb-4">
                  {t("noEventsYet")}
                </p>
                <Button variant="gold" onClick={() => navigate("/create")} className="gap-2">
                  <Plus className="w-4 h-4" /> {t("createEvent")}
                </Button>
              </div>
            ) : (
              mine.map((e) => (
                <EventCard key={e.id} event={e} onClick={() => navigate(`/organizer/${e.id}`)} />
              ))
            )}

            {unclaimed.length > 0 && (
              <div className="pt-4">
                <h3 className="text-sm font-display font-semibold text-foreground mb-1">
                  {t("existingEvents")}
                </h3>
                <p className="text-xs text-muted-foreground font-body mb-3">
                  {t("existingEventsHint")}
                </p>
                <div className="space-y-3">
                  {unclaimed.map((e) => (
                    <EventCard key={e.id} event={e} locked onClick={() => setClaiming(e)} />
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {tab === "settings" && <SettingsPanel email={user?.email} onSignOut={signOut} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-md mx-auto w-full grid grid-cols-3 pt-1 pb-[calc(env(safe-area-inset-bottom)+14px)]">
          {([
            { key: "create", label: t("tabCreate"), Icon: Plus },
            { key: "events", label: t("myEvents"), Icon: Images },
            { key: "settings", label: t("tabSettings"), Icon: SettingsIcon },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-body transition-colors ${
                tab === key ? "text-gold" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Claim dialog */}
      <Dialog open={!!claiming} onOpenChange={(o) => !o && setClaiming(null)}>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{claiming?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-body -mt-2">
            {t("passwordProtected")}
          </p>
          <Input
            type="password"
            placeholder={t("eventPassword")}
            value={claimPw}
            onChange={(e) => setClaimPw(e.target.value)}
            className="h-11 rounded-xl font-body"
          />
          <Button
            variant="gold"
            className="w-full h-11 rounded-xl"
            onClick={handleClaim}
            disabled={claimBusy || !claimPw}
          >
            {claimBusy ? t("pleaseWait") : t("addToMyEvents")}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Hidden admin gate (3 taps on the logo) */}
      <Dialog open={adminOpen} onOpenChange={(o) => !o && setAdminOpen(false)}>
        <DialogContent className="max-w-[320px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{t("adminAccess")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-body -mt-2">
            {t("adminPasswordPrompt")}
          </p>
          <Input
            type="password"
            autoFocus
            placeholder={t("password")}
            value={adminPw}
            onChange={(e) => setAdminPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adminPw && submitAdmin()}
            className="h-11 rounded-xl font-body"
          />
          <Button
            variant="gold"
            className="w-full h-11 rounded-xl"
            onClick={submitAdmin}
            disabled={adminBusy || !adminPw}
          >
            {adminBusy ? t("pleaseWait") : t("unlock")}
          </Button>
        </DialogContent>
      </Dialog>

      <button
        onClick={signOut}
        className="sr-only"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Home;
