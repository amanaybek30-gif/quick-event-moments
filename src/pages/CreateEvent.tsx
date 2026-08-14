import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createOwnedEvent, uploadCoverImage } from "@/lib/eventService";
import stepName from "@/assets/step-name.jpg";
import stepDate from "@/assets/step-date.jpg";
import stepVenue from "@/assets/step-venue.jpg";
import stepCover from "@/assets/step-cover.jpg";
import stepWelcome from "@/assets/hero-event.jpg";
import stepReview from "@/assets/contact-bg.jpg";

const slugify = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "event";

interface Draft {
  name: string;
  date: string;
  venue: string;
  coverFile: File | null;
  coverPreview: string;
  welcomeTitle: string;
  welcomeMessage: string;
}

const STEPS = [
  { key: "name", bg: stepName, title: "What's your event called?", hint: "This is the name your guests will see." },
  { key: "date", bg: stepDate, title: "When is it happening?", hint: "Pick the date of your event." },
  { key: "venue", bg: stepVenue, title: "Where is it taking place?", hint: "Add the venue or location." },
  { key: "cover", bg: stepCover, title: "Add a cover photo", hint: "A beautiful image for your event page." },
  { key: "welcome", bg: stepWelcome, title: "Welcome your guests", hint: "Shown full screen when guests arrive." },
  { key: "review", bg: stepReview, title: "Ready to go live?", hint: "Review your event, then create it." },
] as const;

const CreateEvent = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    name: "",
    date: "",
    venue: "",
    coverFile: null,
    coverPreview: "",
    welcomeTitle: "Welcome!",
    welcomeMessage: "",
  });

  const current = STEPS[step];

  const canContinue = () => {
    switch (current.key) {
      case "name":
        return draft.name.trim().length > 1;
      case "date":
        return !!draft.date;
      case "venue":
        return draft.venue.trim().length > 1;
      default:
        return true;
    }
  };

  const go = (delta: number) => {
    setDir(delta);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + delta)));
  };

  const back = () => (step === 0 ? navigate("/") : go(-1));

  const handleCover = (file: File) => {
    setDraft((d) => ({ ...d, coverFile: file, coverPreview: URL.createObjectURL(file) }));
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const id = `${slugify(draft.name)}-${Math.random().toString(36).slice(2, 7)}`;
      let coverUrl = "";
      if (draft.coverFile) {
        coverUrl = (await uploadCoverImage(id, draft.coverFile)) || "";
      }
      const ok = await createOwnedEvent({
        id,
        name: draft.name.trim(),
        date: draft.date,
        venue: draft.venue.trim(),
        cover_image: coverUrl,
        welcome_title: draft.welcomeTitle.trim() || "Welcome!",
        welcome_message: draft.welcomeMessage.trim(),
      });
      if (!ok) throw new Error("create failed");
      toast.success("Your event is live!");
      navigate(`/organizer/${id}`);
    } catch {
      toast.error("Could not create the event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={current.key}
          src={current.bg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          width={768}
          height={1344}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/70 to-foreground/95" />

      <div className="relative z-10 flex flex-col min-h-[100dvh] max-w-md mx-auto w-full px-5 pt-4 pb-7">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            className="p-2 -ml-2 rounded-full text-primary-foreground/90 active:bg-primary-foreground/10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-gold" : "bg-primary-foreground/25"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current.key}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-body mb-3">
                Step {step + 1} of {STEPS.length}
              </p>
              <h1 className="text-2xl font-display font-bold text-primary-foreground mb-2">
                {current.title}
              </h1>
              <p className="text-primary-foreground/70 font-body text-sm mb-6">{current.hint}</p>

              {current.key === "name" && (
                <Input
                  autoFocus
                  placeholder="e.g. Sara & Daniel's Wedding"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="h-12 rounded-xl bg-background font-body"
                />
              )}

              {current.key === "date" && (
                <Input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className="h-12 rounded-xl bg-background font-body"
                />
              )}

              {current.key === "venue" && (
                <Input
                  placeholder="e.g. Sheraton Addis, Ballroom"
                  value={draft.venue}
                  onChange={(e) => setDraft({ ...draft, venue: e.target.value })}
                  className="h-12 rounded-xl bg-background font-body"
                />
              )}

              {current.key === "cover" && (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCover(e.target.files[0])}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-primary-foreground/30 overflow-hidden flex items-center justify-center bg-primary-foreground/5"
                  >
                    {draft.coverPreview ? (
                      <img
                        src={draft.coverPreview}
                        alt="Selected event cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="flex flex-col items-center gap-2 text-primary-foreground/70 font-body text-sm">
                        <ImagePlus className="w-7 h-7" />
                        Choose a photo
                      </span>
                    )}
                  </button>
                </div>
              )}

              {current.key === "welcome" && (
                <div className="space-y-3">
                  <Input
                    placeholder="Welcome title"
                    value={draft.welcomeTitle}
                    onChange={(e) => setDraft({ ...draft, welcomeTitle: e.target.value })}
                    className="h-12 rounded-xl bg-background font-body"
                  />
                  <Textarea
                    placeholder={"Write a short welcome message\nfor your guests..."}
                    value={draft.welcomeMessage}
                    onChange={(e) => setDraft({ ...draft, welcomeMessage: e.target.value })}
                    rows={5}
                    className="rounded-xl bg-background font-body"
                  />
                </div>
              )}

              {current.key === "review" && (
                <div className="rounded-2xl overflow-hidden bg-card/95 backdrop-blur">
                  {draft.coverPreview && (
                    <img
                      src={draft.coverPreview}
                      alt="Event cover preview"
                      className="w-full h-36 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-4 space-y-2 font-body text-sm">
                    <p className="font-display font-semibold text-lg text-foreground">
                      {draft.name || "Untitled event"}
                    </p>
                    <p className="text-muted-foreground">{draft.date}</p>
                    <p className="text-muted-foreground">{draft.venue}</p>
                    {draft.welcomeMessage && (
                      <p className="text-muted-foreground whitespace-pre-wrap pt-2 border-t border-border">
                        {draft.welcomeMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {current.key === "review" ? (
          <Button
            variant="gold"
            size="lg"
            className="w-full h-13 py-6 rounded-xl gap-2"
            onClick={handleCreate}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Creating..." : "Create Event"}
          </Button>
        ) : (
          <Button
            variant="gold"
            size="lg"
            className="w-full py-6 rounded-xl gap-2"
            onClick={() => go(1)}
            disabled={!canContinue()}
          >
            {current.key === "cover" && !draft.coverFile ? "Skip for now" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
