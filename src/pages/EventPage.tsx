import { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Video, ArrowLeft, User, Eye, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MediaGallery from "@/components/MediaGallery";
import { getStoredEvents, type EventData } from "./AdminDashboard";

type ViewState = "landing" | "camera" | "review" | "gallery";

interface CapturedMedia {
  id: string;
  url: string;
  type: "image" | "video";
  uploadedAt: string;
  uploaderName: string;
}

const EventPage = () => {
  const { eventId } = useParams();
  const [view, setView] = useState<ViewState>("landing");
  const [guestName, setGuestName] = useState("");
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Review state
  const [reviewBlob, setReviewBlob] = useState<Blob | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [reviewType, setReviewType] = useState<"image" | "video">("image");

  useEffect(() => {
    const events = getStoredEvents();
    const found = events.find((e) => e.id === eventId);
    if (found) setEvent(found);
  }, [eventId]);

  const storeMedia = useCallback((blob: Blob, type: "image" | "video") => {
    const media: CapturedMedia = {
      id: `capture-${Date.now()}`,
      url: URL.createObjectURL(blob),
      type,
      uploadedAt: new Date().toISOString(),
      uploaderName: guestName || "Guest",
    };
    setCapturedMedia((existing) => [media, ...existing]);
  }, [guestName]);

  const showReview = (blob: Blob, type: "image" | "video") => {
    setReviewBlob(blob);
    setReviewUrl(URL.createObjectURL(blob));
    setReviewType(type);
    setView("review");
  };

  const handleDone = () => {
    if (reviewBlob) {
      storeMedia(reviewBlob, reviewType);
    }
    // Clean up review
    if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    setReviewBlob(null);
    setReviewUrl(null);
    // Go back to landing (capture interface) so they can take more
    setView("landing");
  };

  const handleRetake = () => {
    if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    setReviewBlob(null);
    setReviewUrl(null);
    // Re-open camera with same mode
    openCamera(reviewType === "image" ? "photo" : "video");
  };

  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const type = file.type.startsWith("video") ? "video" as const : "image" as const;
      storeMedia(file, type);
    });
    // Stay on landing so they can upload more
  }, [storeMedia]);

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
        if (file) {
          const type = mode === "photo" ? "image" as const : "video" as const;
          showReview(file, type);
        }
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
      if (blob) {
        stopCamera();
        showReview(blob, "image");
      }
    }, "image/jpeg", 0.9);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
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

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Event not found</p>
      </div>
    );
  }

  // Camera view
  if (view === "camera") {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <video
          ref={videoRef}
          className="flex-1 w-full object-cover"
          autoPlay
          playsInline
          muted={cameraMode === "photo"}
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => { stopCamera(); setView("landing"); }}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            {cameraMode === "photo" ? (
              <button
                onClick={takePhoto}
                className="w-16 h-16 rounded-full border-4 border-white bg-white/20 active:bg-white/50 transition-colors"
              />
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full border-4 border-white transition-colors flex items-center justify-center ${
                  isRecording ? "bg-red-500" : "bg-red-500/60"
                }`}
              >
                {isRecording && (
                  <div className="w-6 h-6 rounded-sm bg-white" />
                )}
              </button>
            )}
            <div className="w-10" />
          </div>
          {isRecording && (
            <p className="text-center text-red-400 text-sm font-body mt-2 animate-pulse">
              ● Recording...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Review view - show captured photo/video with Done and Retake
  if (view === "review" && reviewUrl) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          {reviewType === "image" ? (
            <img
              src={reviewUrl}
              alt="Review"
              className="max-w-full max-h-[70vh] rounded-xl object-contain"
            />
          ) : (
            <video
              src={reviewUrl}
              className="max-w-full max-h-[70vh] rounded-xl object-contain"
              controls
              autoPlay
              playsInline
            />
          )}
        </div>
        <div className="p-6 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex gap-4 max-w-md mx-auto">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 py-6 text-white border-white/30 bg-white/10 hover:bg-white/20"
              onClick={handleRetake}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button
              variant="gold"
              size="lg"
              className="flex-1 py-6"
              onClick={handleDone}
            >
              <Check className="w-5 h-5 mr-2" />
              Done
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
          <MediaGallery extraMedia={capturedMedia} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Cover Image */}
          <div className="relative h-56 md:h-72">
            <img
              src={event.coverImage}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium gold-gradient text-primary-foreground mb-3">
                  Live Event
                </span>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">
                  {event.name}
                </h1>
                <p className="text-primary-foreground/70 font-body text-sm mt-1">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Capture the Moment 🎓
              </h2>
              <p className="text-muted-foreground font-body">
                Take photos and videos to add to the official event gallery
              </p>
              {capturedMedia.length > 0 && (
                <p className="text-sm text-gold font-body mt-2">
                  ✓ {capturedMedia.length} moment{capturedMedia.length !== 1 ? "s" : ""} captured
                </p>
              )}
            </motion.div>

            {/* Guest name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-6"
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Your name (optional)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="pl-10 h-12 font-body"
                />
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full text-lg py-6 flex-col h-auto gap-1"
                  onClick={() => openCamera("photo")}
                >
                  <Camera className="w-6 h-6" />
                  <span>Take Photo</span>
                </Button>

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full text-lg py-6 flex-col h-auto gap-1"
                  onClick={() => openCamera("video")}
                >
                  <Video className="w-6 h-6" />
                  <span>Record Video</span>
                </Button>
              </div>

              <Button
                variant="gold-outline"
                size="lg"
                className="w-full text-lg py-6"
                onClick={handleFileUpload}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload from Device
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg py-6"
                onClick={() => setView("gallery")}
              >
                <Eye className="w-5 h-5 mr-2" />
                View Gallery {capturedMedia.length > 0 && `(${capturedMedia.length})`}
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-muted-foreground mt-6 font-body"
            >
              Powered by <span className="font-semibold">VION Events</span>
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EventPage;
