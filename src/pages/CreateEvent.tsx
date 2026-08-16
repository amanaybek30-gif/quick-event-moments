import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GUEST_TIERS, PAYMENT_METHODS, SALES_PHONE, tierFor } from "@/lib/pricing";
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
import { useI18n, type TranslationKey } from "@/i18n";

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
  guests: number;
}

const STEPS = [
  { key: "name", bg: stepName, title: "qName", hint: "qNameHint" },
  { key: "date", bg: stepDate, title: "qDate", hint: "qDateHint" },
  { key: "venue", bg: stepVenue, title: "qVenue", hint: "qVenueHint" },
  { key: "cover", bg: stepCover, title: "qCover", hint: "qCoverHint" },
  { key: "welcome", bg: stepWelcome, title: "qWelcome", hint: "qWelcomeHint" },
  { key: "guests", bg: stepVenue, title: "qGuests", hint: "qGuestsHint" },
  { key: "review", bg: stepReview, title: "qReview", hint: "qReviewHint" },
] as const satisfies readonly {
  key: string;
  bg: string;
  title: TranslationKey;
  hint: TranslationKey;
}[];

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
    guests: 10,
  });
  const [payOpen, setPayOpen] = useState(false);
  const [payPage, setPayPage] = useState(0);
  const [payPhone, setPayPhone] = useState("");
  const [payRef, setPayRef] = useState("");
  const { t } = useI18n();

  const priceLabel = (price: number | null) =>
    price === null ? t("custom") : price === 0 ? t("free") : `${price.toLocaleString()} Birr`;

  const tier = tierFor(draft.guests);
  const isCustom = tier.price === null;

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
    if (isCustom) {
      window.location.href = `sms:${SALES_PHONE}`;
      return;
    }
    const paid = !!tier.price && tier.price > 0;
    if (paid && !payOpen) {
      setPayPage(0);
      setPayOpen(true);
      return;
    }
    if (paid && (payPhone.trim().length < 7 || payRef.trim().length < 4)) {
      toast.error(t("paymentFieldsRequired"));
      return;
    }
    setSaving(true);
    try {
      const id = `${slugify(draft.name)}-${Math.random().toString(36).slice(2, 7)}`;
      let coverUrl = "";
      if (draft.coverFile) {
        coverUrl = (await uploadCoverImage(id, draft.coverFile)) || "";
      }
      const ok = await createOwnedEvent(
        {
          id,
          name: draft.name.trim(),
          date: draft.date,
          venue: draft.venue.trim(),
          cover_image: coverUrl,
          welcome_title: draft.welcomeTitle.trim() || "Welcome!",
          welcome_message: draft.welcomeMessage.trim(),
          guest_limit: draft.guests,
        },
        paid
          ? {
              payer_phone: payPhone.trim(),
              transaction_ref: payRef.trim(),
              payment_method: PAYMENT_METHODS[payPage].name,
            }
          : undefined
      );
      if (!ok) throw new Error("create failed");
      setPayOpen(false);
      toast.success(paid ? t("eventPending") : t("eventLive"));
      navigate(paid ? "/" : `/organizer/${id}`);
    } catch {
      toast.error(t("createFailed"));
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

      <div className="relative z-10 flex flex-col min-h-[100dvh] max-w-md mx-auto w-full px-5 pt-4 pb-12">
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
                {t("stepOf", { n: step + 1, total: STEPS.length })}
              </p>
              <h1 className="text-2xl font-display font-bold text-primary-foreground mb-2">
                {t(current.title)}
              </h1>
              <p className="text-primary-foreground/70 font-body text-sm mb-6">{t(current.hint)}</p>

              {current.key === "name" && (
                <Input
                  autoFocus
                  placeholder={t("namePlaceholder")}
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
                  placeholder={t("venuePlaceholder")}
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
                        {t("choosePhoto")}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {current.key === "welcome" && (
                <div className="space-y-3">
                  <Input
                    placeholder={t("welcomeTitle")}
                    value={draft.welcomeTitle}
                    onChange={(e) => setDraft({ ...draft, welcomeTitle: e.target.value })}
                    className="h-12 rounded-xl bg-background font-body"
                  />
                  <Textarea
                    placeholder={t("welcomeMessagePlaceholder")}
                    value={draft.welcomeMessage}
                    onChange={(e) => setDraft({ ...draft, welcomeMessage: e.target.value })}
                    rows={5}
                    className="rounded-xl bg-background font-body"
                  />
                </div>
              )}

              {current.key === "guests" && (
                <div>
                  <div className="rounded-3xl bg-primary-foreground/10 border border-primary-foreground/15 p-5 text-center backdrop-blur">
                    <Users className="w-5 h-5 text-gold mx-auto mb-2" />
                    <p className="text-4xl font-display font-bold text-primary-foreground leading-none">
                      {isCustom ? "200+" : draft.guests}
                    </p>
                    <p className="text-xs text-primary-foreground/70 font-body mt-1">{t("guests")}</p>
                    <p className="mt-3 text-lg font-display font-semibold text-gold">
                      {priceLabel(tier.price)}
                    </p>
                  </div>

                  <div
                    className="mt-5 flex gap-3 overflow-x-auto snap-x snap-mandatory px-[38%] -mx-5 scrollbar-none"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {GUEST_TIERS.map((tt) => {
                      const active = tt.guests === draft.guests;
                      return (
                        <button
                          key={tt.guests}
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, guests: tt.guests }))}
                          className={`snap-center shrink-0 w-20 h-20 rounded-full flex flex-col items-center justify-center font-body transition-all ${
                            active
                              ? "gold-gradient text-primary-foreground scale-110 shadow-lg"
                              : "bg-primary-foreground/10 text-primary-foreground/70 border border-primary-foreground/20"
                          }`}
                        >
                          <span className="text-base font-display font-bold">
                            {tt.price === null ? "200+" : tt.guests}
                          </span>
                          <span className="text-[10px] opacity-80">
                            {tt.price === null
                              ? t("custom")
                              : tt.price === 0
                                ? t("free")
                                : `${tt.price} Br`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {isCustom && (
                    <a
                      href={`sms:${SALES_PHONE}`}
                      className="mt-5 flex items-center justify-center gap-2 h-12 rounded-xl gold-gradient text-primary-foreground font-body font-medium"
                    >
                      <MessageSquare className="w-4 h-4" /> {t("contactForCustom")}
                    </a>
                  )}
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
                      {draft.name || t("untitledEvent")}
                    </p>
                    <p className="text-muted-foreground">{draft.date}</p>
                    <p className="text-muted-foreground">{draft.venue}</p>
                    <p className="text-foreground font-medium">
                      {isCustom ? "200+" : tier.guests} {t("guests")} · {priceLabel(tier.price)}
                    </p>
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
            {saving
              ? t("creating")
              : isCustom
                ? t("contactForCustom")
                : tier.price && tier.price > 0
                  ? `${t("pay")} ${priceLabel(tier.price)}`
                  : t("createEvent")}
          </Button>
        ) : (
          <Button
            variant="gold"
            size="lg"
            className="w-full py-6 rounded-xl gap-2"
            onClick={() => go(1)}
            disabled={!canContinue()}
          >
            {current.key === "cover" && !draft.coverFile ? t("skipForNow") : t("next")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("pay")} {priceLabel(tier.price)}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 -mt-1">
            {PAYMENT_METHODS.map((m, i) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setPayPage(i)}
                className={`flex-1 h-9 rounded-lg text-xs font-body transition-colors ${
                  payPage === i
                    ? "gold-gradient text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border p-4 space-y-2 font-body text-sm">
            {PAYMENT_METHODS[payPage].fields.map((f) => (
              <div key={f.label} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-foreground text-right">{f.value}</span>
              </div>
            ))}
            <div className="flex justify-between gap-3 pt-2 border-t border-border">
              <span className="text-muted-foreground">{t("amount")}</span>
              <span className="font-semibold text-gold">{priceLabel(tier.price)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-body">
            {t("paymentInstructions")}
          </p>

          <Input
            value={payPhone}
            onChange={(e) => setPayPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            placeholder={t("yourPhone")}
            className="h-11 rounded-xl font-body"
          />
          <Input
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            placeholder={t("transactionRef")}
            className="h-11 rounded-xl font-body"
          />

          <Button
            variant="gold"
            className="w-full h-11 rounded-xl"
            onClick={handleCreate}
            disabled={saving}
          >
            {saving ? t("creating") : t("ivePaid")}
          </Button>
          <a
            href={`tel:${SALES_PHONE}`}
            className="text-center text-xs text-muted-foreground font-body underline-offset-4 underline"
          >
            {t("needHelp")} {SALES_PHONE}
          </a>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateEvent;
