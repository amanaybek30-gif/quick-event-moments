import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, SwitchCamera } from "lucide-react";
import { uploadMedia, type MediaItem } from "@/lib/eventService";
import { compressImage, compressVideo } from "@/lib/mediaCompression";

const MAX_RECORDING_MS = 30 * 60 * 1000;

const RECORDING_MIME_TYPES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp8,opus",
  "video/webm",
] as const;

const getPreferredRecordingMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  return RECORDING_MIME_TYPES.find((c) => MediaRecorder.isTypeSupported(c)) ?? "";
};

const getCameraConstraints = (
  mode: "photo" | "video",
  facing: "environment" | "user",
  fallback = false
): MediaStreamConstraints => ({
  video: fallback
    ? { facingMode: facing }
    : {
        facingMode: facing,
        width: { ideal: 1920, max: 3840 },
        height: { ideal: 1080, max: 2160 },
        frameRate: { ideal: 30, max: 60 },
      },
  audio:
    mode === "video"
      ? fallback
        ? true
        : {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: { ideal: 2 },
            sampleRate: { ideal: 48000 },
          }
      : false,
});

const requestFullscreen = () => {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => undefined);
  else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
};

const exitFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
  else if ((document as any).webkitFullscreenElement) (document as any).webkitExitFullscreen?.();
};

interface Props {
  eventId: string;
  uploaderName?: string;
  onClose: () => void;
  onUploaded?: (item: MediaItem) => void;
}

const HostCameraOverlay = ({ eventId, uploaderName = "Host", onClose, onUploaded }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const hwZoomRange = useRef<{ min: number; max: number } | null>(null);
  const hwDefaultZoom = useRef<number>(1);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartZoom = useRef<number>(1);

  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isRecording, setIsRecording] = useState(false);
  const [savingCount, setSavingCount] = useState(0);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const showFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 2000);
  };

  const persistMedia = useCallback(
    async (blob: Blob, type: "image" | "video") => {
      setSavingCount((c) => c + 1);
      try {
        const compressed = type === "image" ? await compressImage(blob) : await compressVideo(blob);
        const item = await uploadMedia(eventId, compressed, type, uploaderName);
        if (item) {
          onUploaded?.(item);
          showFlash(type === "image" ? "📸 Photo saved!" : "🎬 Video saved!");
        } else {
          showFlash("Upload failed, try again");
        }
      } catch {
        showFlash("Upload failed, try again");
      }
      setSavingCount((c) => c - 1);
    },
    [eventId, uploaderName, onUploaded]
  );

  const stopCamera = useCallback(() => {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false);
      return;
    }
    setIsRecording(false);
    await new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.stop();
    });
  }, []);

  const startCamera = useCallback(
    async (mode: "photo" | "video", facing: "environment" | "user") => {
      if (mediaRecorderRef.current?.state === "recording") await stopRecording();
      stopCamera();
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(getCameraConstraints(mode, facing));
        } catch {
          stream = await navigator.mediaDevices.getUserMedia(getCameraConstraints(mode, facing, true));
        }
        stream.getVideoTracks().forEach((t) => { t.enabled = true; t.contentHint = "motion"; });
        stream.getAudioTracks().forEach((t) => { t.enabled = true; t.contentHint = "speech"; });
        streamRef.current = stream;

        const vTrack = stream.getVideoTracks()[0];
        const caps = vTrack?.getCapabilities?.() as any;
        if (caps?.zoom) {
          hwZoomRange.current = { min: caps.zoom.min, max: caps.zoom.max };
          const settings = vTrack?.getSettings?.() as any;
          hwDefaultZoom.current = settings?.zoom ?? caps.zoom.min;
        } else {
          hwZoomRange.current = null;
          hwDefaultZoom.current = 1;
        }
        setZoomLevel(1);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        stopCamera();
        // Fallback: native camera app capture
        const input = document.createElement("input");
        input.type = "file";
        input.accept = mode === "photo" ? "image/*" : "video/*";
        input.capture = facing === "user" ? "user" : "environment";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) void persistMedia(file, file.type.startsWith("video") ? "video" : "image");
        };
        input.click();
        exitFullscreen();
        onClose();
      }
    },
    [persistMedia, stopCamera, stopRecording, onClose]
  );

  // Open the camera as soon as the overlay mounts (button click is the gesture)
  useEffect(() => {
    requestFullscreen();
    void startCamera("photo", "environment");
    return () => {
      stopCamera();
      exitFullscreen();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyZoom = useCallback((level: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    const clamped = Math.min(Math.max(level, 0.5), 5);
    setZoomLevel(clamped);
    if (!track) return;
    const hw = hwZoomRange.current;
    if (hw && hw.max > hw.min) {
      const d = hwDefaultZoom.current;
      let hwLevel =
        clamped <= 1
          ? hw.min + ((clamped - 0.5) / 0.5) * (d - hw.min)
          : d + ((clamped - 1) / 4) * (hw.max - d);
      hwLevel = Math.min(Math.max(hwLevel, hw.min), hw.max);
      try { (track as any).applyConstraints({ advanced: [{ zoom: hwLevel }] }); } catch {}
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist.current = Math.hypot(dx, dy);
      pinchStartZoom.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      applyZoom(pinchStartZoom.current * (Math.hypot(dx, dy) / pinchStartDist.current));
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
    if (facingMode === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => { if (blob) void persistMedia(blob, "image"); }, "image/jpeg", 0.92);
  };

  const startRecording = async () => {
    let activeStream = streamRef.current;
    if (!activeStream) return;
    if (activeStream.getAudioTracks().length === 0) {
      await startCamera("video", facingMode);
      activeStream = streamRef.current;
    }
    if (!activeStream || activeStream.getAudioTracks().length === 0) {
      showFlash("Please allow microphone access for video audio");
      return;
    }
    const mimeType = getPreferredRecordingMimeType();
    chunksRef.current = [];
    const recorder = new MediaRecorder(activeStream, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: 6_000_000,
      audioBitsPerSecond: 128_000,
    });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onerror = () => { showFlash("Video recording failed, please try again"); setIsRecording(false); };
    recorder.onstop = () => {
      const finalMimeType = mimeType || recorder.mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type: finalMimeType });
      chunksRef.current = [];
      mediaRecorderRef.current = null;
      if (blob.size > 0) void persistMedia(blob, "video");
      else showFlash("Video could not be saved, please try again");
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    recordingTimeoutRef.current = window.setTimeout(() => {
      showFlash("30 minute limit reached — saving video");
      void stopRecording();
    }, MAX_RECORDING_MS);
  };

  const flipCamera = async () => {
    if (isRecording) await stopRecording();
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    await startCamera(cameraMode, newFacing);
  };

  const switchMode = async (mode: "photo" | "video") => {
    if (mode === cameraMode) return;
    if (isRecording) await stopRecording();
    setCameraMode(mode);
    await startCamera(mode, facingMode);
  };

  const handleClose = async () => {
    if (isRecording) await stopRecording();
    stopCamera();
    exitFullscreen();
    onClose();
  };

  const basePills = [0.5, 1];
  const extraPills: number[] = [];
  if (zoomLevel >= 1.5) extraPills.push(2);
  if (zoomLevel >= 2.5) extraPills.push(3);
  if (zoomLevel >= 4) extraPills.push(5);
  const pills = [...basePills, ...extraPills];

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col z-50 overflow-hidden"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => { pinchStartDist.current = null; }}
    >
      <video
        ref={videoRef}
        className={`flex-1 w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      <AnimatePresence>
        {flashMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-body z-20"
          >
            {flashMessage}
          </motion.div>
        )}
      </AnimatePresence>
      {savingCount > 0 && (
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-body z-20 animate-pulse">
          Saving {savingCount}...
        </div>
      )}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1.5 z-10"
        style={{ bottom: "180px" }}
      >
        {pills.map((p) => {
          const isActive = Math.abs(zoomLevel - p) < 0.2;
          return (
            <button
              key={p}
              onClick={() => applyZoom(p)}
              className={`rounded-full font-body font-semibold transition-all duration-200 flex items-center justify-center ${isActive ? "w-9 h-9 bg-yellow-400/90 text-black text-xs" : "w-7 h-7 bg-white/15 text-white/80 text-[10px]"}`}
            >
              {p === 0.5 ? ".5" : `${p}`}×
            </button>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 pb-8 pt-16 bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex items-center justify-center gap-6 mb-5">
          <button
            onClick={() => switchMode("photo")}
            className={`text-sm font-body font-semibold uppercase tracking-wider transition-colors ${cameraMode === "photo" ? "text-yellow-400" : "text-white/60"}`}
          >
            Photo
          </button>
          <button
            onClick={() => switchMode("video")}
            className={`text-sm font-body font-semibold uppercase tracking-wider transition-colors ${cameraMode === "video" ? "text-yellow-400" : "text-white/60"}`}
          >
            Video
          </button>
        </div>
        <div className="flex items-center justify-between px-8">
          <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white" onClick={handleClose}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          {cameraMode === "photo" ? (
            <button onClick={takePhoto} className="w-20 h-20 rounded-full border-4 border-white bg-white/20 active:bg-white/50 transition-all active:scale-95" />
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full border-4 border-white transition-all flex items-center justify-center ${isRecording ? "bg-red-500" : "bg-red-500/60"}`}
            >
              {isRecording && <div className="w-7 h-7 rounded-sm bg-white" />}
            </button>
          )}
          <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white" onClick={flipCamera}>
            <SwitchCamera className="w-6 h-6" />
          </button>
        </div>
        {isRecording && <p className="text-center text-red-400 text-sm font-body mt-3 animate-pulse">● Recording... max 30 min</p>}
      </div>
    </div>
  );
};

export default HostCameraOverlay;
