import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Video, ArrowLeft, User, Eye, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchEventById,
  fetchEventMedia,
  uploadMedia,
  type EventData,
  type MediaItem,
} from "@/lib/eventService";
import { compressImage, compressVideo } from "@/lib/mediaCompression";
import MediaGallery from "@/components/MediaGallery";

type ViewState = "landing" | "camera" | "review" | "gallery";

const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>("landing");
  const [guestName, setGuestName] = useState("");
  const [capturedCount, setCapturedCount] = useState(0);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [showWelcome, setShowWelcome] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reviewBlob, setReviewBlob] = useState<Blob | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [reviewType, setReviewType] = useState<"image" | "video">("image");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      setLoading(true);
      const found = await fetchEventById(eventId);
      if (found) {
        setEvent(found);
        if (found.welcome_message) {
          const welcomeKey = `momentique_welcome_${eventId}`;
          if (!sessionStorage.getItem(welcomeKey)) {
            setShowWelcome(true);
            sessionStorage.setItem(welcomeKey, "true");
          }
        }
        const media = await fetchEventMedia(eventId);
        setMediaItems(media);
        setCapturedCount(media.length);
      }
      setLoading(false);
    };
    load();
  }, [eventId]);

  const persistMedia = useCallback(async (blob: Blob, type: "image" | "video") => {
    if (!eventId) return;
    setSaving(true);
    const item = await uploadMedia(eventId, blob, type, guestName || "Guest");
    if (item) {
      setMediaItems((prev) => [item, ...prev]);
      setCapturedCount((c) => c + 1);
    }
    setSaving(false);
  }, [eventId, guestName]);

  const showReview = (blob: Blob, type: "image" | "video") => {
    setReviewBlob(blob);
    setReviewUrl(URL.createObjectURL(blob));
    setReviewType(type);
    setView("review");
  };

  const handleDone = async () => {
    if (reviewBlob) await persistMedia(reviewBlob, reviewType);
    if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    setReviewBlob(null);
    setReviewUrl(null);
    setView("landing");
  };

  const handleRetake = () => {
    if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    setReviewBlob(null);
    setReviewUrl(null);
    openCamera(reviewType === "image" ? "photo" : "video");
  };

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const type = file.type.startsWith("video") ? "video" as const : "image" as const;
      await persistMedia(file, type);
    }
  }, [persistMedia]);

  const openCamera = async (mode: "photo" | "video") => {
    setCameraMode(mode);
    setView("camera");
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: mode === "video",
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      stopCamera();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = mode === "photo" ? "image/*" : "video/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) showReview(file, mode === "photo" ? "image" : "video");
      };
      input.click();
      setView("landing");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) { stopCamera(); showReview(blob, "image"); }
    }, "image/jpeg", 0.9);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      stopCamera();
      showReview(blob, "video");
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.multiple = true;
    input.onchange = (e) => processFiles((e.target as HTMLInputElement).files);
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-body">Event not found</p>
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  const welcomePopup = showWelcome && event.welcome_message && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4" onClick={() => setShowWelcome(false)}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-3">Welcome!</h2>
        <p className="text-muted-foreground font-body mb-6">{event.welcome_message}</p>
        <Button variant="gold" size="lg" className="w-full py-5" onClick={() => setShowWelcome(false)}>Let's Go!</Button>
      </motion.div>
    </motion.div>
  );

  const galleryMedia = mediaItems.map((m) => ({
    id: m.id,
    url: m.file_url,
    type: m.type as "image" | "video",
    uploadedAt: m.uploaded_at,
    uploaderName: m.uploader_name,
  }));

  if (view === "camera") {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <video ref={videoRef} className="flex-1 w-full object-cover" autoPlay playsInline muted={cameraMode === "photo"} />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-6">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => { stopCamera(); setView("landing"); }}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            {cameraMode === "photo" ? (
              <button onClick={takePhoto} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 active:bg-white/50 transition-colors" />
            ) : (
              <button onClick={isRecording ? stopRecording : startRecording} className={`w-16 h-16 rounded-full border-4 border-white transition-colors flex items-center justify-center ${isRecording ? "bg-red-500" : "bg-red-500/60"}`}>
                {isRecording && <div className="w-6 h-6 rounded-sm bg-white" />}
              </button>
            )}
            <div className="w-10" />
          </div>
          {isRecording && <p className="text-center text-red-400 text-sm font-body mt-2 animate-pulse">● Recording...</p>}
        </div>
      </div>
    );
  }

  if (view === "review" && reviewUrl) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          {reviewType === "image" ? (
            <img src={reviewUrl} alt="Review" className="max-w-full max-h-[70vh] rounded-xl object-contain" />
          ) : (
            <video src={reviewUrl} className="max-w-full max-h-[70vh] rounded-xl object-contain" controls autoPlay playsInline />
          )}
        </div>
        <div className="p-6 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex gap-4 max-w-md mx-auto">
            <Button variant="outline" size="lg" className="flex-1 py-6 text-white border-white/30 bg-white/10 hover:bg-white/20" onClick={handleRetake}>
              <RotateCcw className="w-5 h-5 mr-2" /> Retake
            </Button>
            <Button variant="gold" size="lg" className="flex-1 py-6" onClick={handleDone} disabled={saving}>
              <Check className="w-5 h-5 mr-2" /> {saving ? "Saving..." : "Done"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "gallery") {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="container mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView("landing")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-foreground text-lg">{event.name}</h1>
              <p className="text-sm text-muted-foreground font-body">Event Gallery</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <MediaGallery extraMedia={galleryMedia} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {welcomePopup}
      <AnimatePresence mode="wait">
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="relative h-56 md:h-72">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10 text-white bg-black/30 hover:bg-black/50" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            {event.cover_image ? (
              <img src={event.cover_image} alt={event.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium gold-gradient text-primary-foreground mb-3">Live Event</span>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">{event.name}</h1>
                <p className="text-primary-foreground/70 font-body text-sm mt-1">
                  {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 max-w-lg">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Capture the Moment ✨</h2>
              <p className="text-muted-foreground font-body">Take photos and videos to add to the event gallery</p>
              {capturedCount > 0 && <p className="text-sm text-gold font-body mt-2">✓ {capturedCount} moment{capturedCount !== 1 ? "s" : ""} captured</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Your name (optional)" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="pl-10 h-12 font-body" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="gold" size="lg" className="w-full text-lg py-6 flex-col h-auto gap-1" onClick={() => openCamera("photo")}>
                  <Camera className="w-6 h-6" /><span>Take Photo</span>
                </Button>
                <Button variant="gold" size="lg" className="w-full text-lg py-6 flex-col h-auto gap-1" onClick={() => openCamera("video")}>
                  <Video className="w-6 h-6" /><span>Record Video</span>
                </Button>
              </div>
              <Button variant="gold-outline" size="lg" className="w-full text-lg py-6" onClick={handleFileUpload}>
                <Upload className="w-5 h-5 mr-2" /> Upload from Device
              </Button>
              <Button variant="outline" size="lg" className="w-full text-lg py-6" onClick={() => setView("gallery")}>
                <Eye className="w-5 h-5 mr-2" /> View Gallery {capturedCount > 0 && `(${capturedCount})`}
              </Button>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs text-muted-foreground mt-6 font-body">
              Powered by <span className="font-semibold">VION Events</span>
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EventPage;
