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

type Tab = "create" | "events" | "settings";

const EventCard = ({
  event,
  locked,
  onClick,
}: {
  event: EventData;
  locked?: boolean;
  onClick: () => void;
}) => (
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
          {event.uploads ?? 0} uploads
        </p>
      </div>
    </div>
  </motion.button>
);

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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
      toast.error("Incorrect password");
      return;
    }
    const id = claiming.id;
    setClaiming(null);
    setClaimPw("");
    toast.success("Event added to your events");
    navigate(`/organizer/${id}`);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto w-full px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-display font-bold text-foreground">
            Moment<span className="text-gold">ique</span>
          </h1>
          <QrScannerFab variant="inline" label="Scan QR" />
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
                  <Sparkles className="w-3 h-3" /> Self-service
                </span>
                <h2 className="text-2xl font-display font-bold text-primary-foreground leading-tight">
                  Capture every moment together
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
              Create New Event
            </Button>

            <div className="mt-6 space-y-3">
              {[
                { n: "1", t: "Set up your event", d: "Name, date, venue, cover photo and a welcome message." },
                { n: "2", t: "Share your QR code", d: "Guests scan and upload photos and videos instantly." },
                { n: "3", t: "Collect & download", d: "Everything lands in one gallery, ready to save." },
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
            <h2 className="text-xl font-display font-bold text-foreground">My Events</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground font-body py-6">Loading your events...</p>
            ) : mine.length === 0 ? (
              <div className="text-center py-10">
                <CalendarPlus className="w-9 h-9 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body mb-4">
                  You haven't created any events yet.
                </p>
                <Button variant="gold" onClick={() => navigate("/create")} className="gap-2">
                  <Plus className="w-4 h-4" /> Create Event
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
                  Existing events
                </h3>
                <p className="text-xs text-muted-foreground font-body mb-3">
                  Enter the event password to add one of these to your events.
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
            { key: "create", label: "Create", Icon: Plus },
            { key: "events", label: "My Events", Icon: Images },
            { key: "settings", label: "Settings", Icon: SettingsIcon },
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
            This event is password protected. Enter its password to add it to your events.
          </p>
          <Input
            type="password"
            placeholder="Event password"
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
            {claimBusy ? "Checking..." : "Add to My Events"}
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
