import { useState, useRef, useEffect, useCallback } from "react";
import { QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const QrScannerFab = () => {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const navigate = useNavigate();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setScanning(false);
  }, []);

  const handleDetected = useCallback(
    (url: string) => {
      stopCamera();
      try {
        const parsed = new URL(url);
        // Check if it's a link to our platform
        const validHosts = [
          window.location.hostname,
          "momentique.vionevents.com",
          "quick-event-moments.lovable.app",
        ];
        if (validHosts.includes(parsed.hostname)) {
          navigate(parsed.pathname + parsed.search);
        } else {
          toast.error("This QR code doesn't belong to Momentique");
        }
      } catch {
        toast.error("Invalid QR code");
      }
    },
    [navigate, stopCamera]
  );

  const startScanning = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        scanFrame();
      }
    } catch {
      toast.error("Unable to access camera");
      setScanning(false);
    }
  };

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Use BarcodeDetector if available (Chrome, Safari 17.2+)
    if ("BarcodeDetector" in window) {
      const detector = new (window as any).BarcodeDetector({
        formats: ["qr_code"],
      });
      detector
        .detect(canvas)
        .then((barcodes: any[]) => {
          if (barcodes.length > 0) {
            handleDetected(barcodes[0].rawValue);
            return;
          }
          animFrameRef.current = requestAnimationFrame(scanFrame);
        })
        .catch(() => {
          animFrameRef.current = requestAnimationFrame(scanFrame);
        });
    } else {
      // Fallback: prompt user to use a QR scanner app
      // We'll keep scanning but show a message after a delay
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [handleDetected]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Check BarcodeDetector support on mount and show fallback message
  const [noDetector, setNoDetector] = useState(false);
  useEffect(() => {
    if (!("BarcodeDetector" in window)) {
      setNoDetector(true);
    }
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={startScanning}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full gold-gradient text-primary-foreground text-xs font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Scan QR Code"
      >
        <QrCode className="w-4 h-4" />
        <span>Scan QR</span>
      </button>

      {/* Scanner overlay */}
      {scanning && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={stopCamera}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 md:w-72 md:h-72 border-2 border-white/60 rounded-2xl" />
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white/80 text-sm font-body">
              Point camera at a Momentique QR code
            </p>
            {noDetector && (
              <p className="text-yellow-300 text-xs mt-2 px-4">
                Your browser may not support QR scanning. Try using Safari or Chrome for best results.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QrScannerFab;
