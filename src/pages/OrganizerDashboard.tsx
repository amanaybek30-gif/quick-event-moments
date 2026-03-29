import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  QrCode,
  Upload,
  Users,
  Image as ImageIcon,
  Share2,
  Lock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import MediaGallery from "@/components/MediaGallery";
import { getStoredEvents, type EventData } from "./AdminDashboard";

const OrganizerDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [qrOpen, setQrOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [event, setEvent] = useState<EventData | null>(null);

  useEffect(() => {
    const events = getStoredEvents();
    const found = events.find((e) => e.id === eventId);
    if (found) {
      setEvent(found);
      // Check if already authenticated via admin or session
      const role = localStorage.getItem("mv_role");
      const sessionKey = `organizer_auth_${eventId}`;
      if (role === "admin" || sessionStorage.getItem(sessionKey) === "true") {
        setAuthenticated(true);
      }
    }
  }, [eventId]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (event && passwordInput === event.password) {
      setAuthenticated(true);
      sessionStorage.setItem(`organizer_auth_${eventId}`, "true");
      toast({ title: "Access granted!", description: "Welcome to the event dashboard." });
    } else {
      toast({ title: "Wrong password", description: "Please try again.", variant: "destructive" });
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Event not found</p>
      </div>
    );
  }

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Button variant="ghost" size="sm" className="mb-8" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {event.name}
            </h1>
            <p className="text-muted-foreground font-body">Enter the event password to continue</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Event password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="pl-10 h-12 font-body"
                required
                autoFocus
              />
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full py-6">
              Access Event
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-6 font-body">
            Powered by <span className="font-semibold">VION Events</span>
          </p>
        </motion.div>
      </div>
    );
  }

  const eventUrl = `${window.location.origin}/event/${eventId}`;

  const downloadQR = () => {
    const svg = document.querySelector("#qr-code-svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.drawImage(img, 64, 64, 896, 896);
      }
      const link = document.createElement("a");
      link.download = `${event.name.replace(/\s+/g, "-")}-QR.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "QR code downloaded!" });
    };
    img.src = url;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    toast({ title: "Link copied!", description: "Share this link with your guests." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-foreground truncate">
              {event.name}
            </h1>
            <p className="text-sm text-muted-foreground font-body">
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl overflow-hidden mb-6 h-40 md:h-56"
        >
          <img
            src={event.coverImage}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        </motion.div>

        {/* Stats & Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <Upload className="w-5 h-5 text-gold mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-foreground">{event.uploads}</p>
            <p className="text-xs text-muted-foreground font-body">Uploads</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <Users className="w-5 h-5 text-gold mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-foreground">{event.contributors}</p>
            <p className="text-xs text-muted-foreground font-body">Contributors</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <ImageIcon className="w-5 h-5 text-gold mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-foreground">
              {Math.round(event.uploads * 0.7)}
            </p>
            <p className="text-xs text-muted-foreground font-body">Photos</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Dialog open={qrOpen} onOpenChange={setQrOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" className="flex-1">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm text-center">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Event QR Code</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-xl border border-border">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={eventUrl}
                    size={220}
                    level="H"
                    fgColor="#1a1a1a"
                    bgColor="#ffffff"
                  />
                </div>
                <p className="text-sm text-muted-foreground font-body break-all px-4">
                  {eventUrl}
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="gold" className="flex-1" onClick={downloadQR}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button variant="gold-outline" className="flex-1" onClick={copyLink}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="gold-outline" className="flex-1" onClick={copyLink}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
        </div>

        {/* Gallery */}
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Event Gallery
        </h2>
        <MediaGallery showDownload />
      </div>
    </div>
  );
};

export default OrganizerDashboard;
