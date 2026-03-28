import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Video, CheckCircle2, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import MediaGallery from "@/components/MediaGallery";
import heroImage from "@/assets/hero-event.jpg";

type UploadState = "idle" | "uploading" | "success";

const DEMO_EVENT = {
  id: "demo",
  name: "Class of 2026 Graduation",
  date: "2026-06-15",
  description: "Celebrate with us! Share your photos and videos.",
  coverImage: heroImage,
};

const EventPage = () => {
  const { eventId } = useParams();
  const [view, setView] = useState<"landing" | "upload" | "gallery">("landing");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [guestName, setGuestName] = useState("");

  const event = DEMO_EVENT;

  const simulateUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadState("uploading");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState("success");
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const handleCapture = (type: "photo" | "video") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "photo" ? "image/*" : "video/*";
    input.capture = "environment";
    input.onchange = (e) => simulateUpload((e.target as HTMLInputElement).files);
    input.click();
    setView("upload");
  };

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.multiple = true;
    input.onchange = (e) => simulateUpload((e.target as HTMLInputElement).files);
    input.click();
    setView("upload");
  };

  const resetUpload = () => {
    setUploadState("idle");
    setProgress(0);
    setView("landing");
  };

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
          <MediaGallery />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {view === "landing" && (
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
                  Upload your photos and videos to the official event gallery
                </p>
              </motion.div>

              {/* Guest name (optional) */}
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
                    onClick={() => handleCapture("photo")}
                  >
                    <Camera className="w-6 h-6" />
                    <span>Take Photo</span>
                  </Button>

                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full text-lg py-6 flex-col h-auto gap-1"
                    onClick={() => handleCapture("video")}
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
              </motion.div>

              {/* View Gallery Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <Button
                  variant="link"
                  className="text-primary font-body"
                  onClick={() => setView("gallery")}
                >
                  View Event Gallery →
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {view === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-4"
          >
            <div className="w-full max-w-md text-center">
              {uploadState === "uploading" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-primary-foreground animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    Uploading...
                  </h2>
                  <p className="text-muted-foreground font-body mb-6">
                    Please keep this page open
                  </p>
                  <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground font-body">
                    {Math.min(Math.round(progress), 100)}%
                  </p>
                </motion.div>
              )}

              {uploadState === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    ✅ Your upload has been added!
                  </h2>
                  <p className="text-muted-foreground font-body mb-8">
                    Thank you for capturing the moment 🎉
                  </p>
                  <div className="space-y-3">
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full py-6"
                      onClick={resetUpload}
                    >
                      Upload Another
                    </Button>
                    <Button
                      variant="gold-outline"
                      size="lg"
                      className="w-full py-6"
                      onClick={() => {
                        setUploadState("idle");
                        setView("gallery");
                      }}
                    >
                      View Gallery
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventPage;
