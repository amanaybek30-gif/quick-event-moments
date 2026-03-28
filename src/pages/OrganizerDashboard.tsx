import { useState } from "react";
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
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import MediaGallery from "@/components/MediaGallery";
import heroImage from "@/assets/hero-event.jpg";

const DEMO_EVENT = {
  id: "demo",
  name: "Class of 2026 Graduation",
  date: "2026-06-15",
  description: "Annual graduation ceremony",
  coverImage: heroImage,
  uploads: 47,
  contributors: 23,
};

const OrganizerDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [qrOpen, setQrOpen] = useState(false);
  const event = DEMO_EVENT;

  const eventUrl = `${window.location.origin}/event/${eventId || event.id}`;

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
      ctx?.drawImage(img, 0, 0, 1024, 1024);
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
            <Upload className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-foreground">{event.uploads}</p>
            <p className="text-xs text-muted-foreground font-body">Uploads</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-foreground">{event.contributors}</p>
            <p className="text-xs text-muted-foreground font-body">Contributors</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <ImageIcon className="w-5 h-5 text-primary mx-auto mb-1" />
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
                <div className="p-4 bg-card rounded-xl border border-border">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={eventUrl}
                    size={220}
                    level="H"
                    fgColor="hsl(220, 15%, 15%)"
                    bgColor="transparent"
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
