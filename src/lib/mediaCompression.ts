import imageCompression from "browser-image-compression";

/**
 * Compress an image while preserving quality.
 * Target: max 2MB, keep original dimensions up to 4096px.
 */
export const compressImage = async (blob: Blob): Promise<Blob> => {
  try {
    const file = blob instanceof File ? blob : new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" });
    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      initialQuality: 0.85,
      preserveExif: true,
    });
    return compressed;
  } catch (err) {
    console.warn("Image compression failed, using original:", err);
    return blob;
  }
};

/**
 * Compress a video by re-encoding at a lower bitrate using MediaRecorder.
 * Preserves resolution. Falls back to original on failure.
 */
export const compressVideo = async (blob: Blob): Promise<Blob> => {
  // For videos under 5MB, skip compression
  if (blob.size < 5 * 1024 * 1024) return blob;

  try {
    const url = URL.createObjectURL(blob);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Video load failed"));
    });

    // Use canvas + MediaRecorder to re-encode at lower bitrate
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    const stream = canvas.captureStream(30);

    // Try to get audio track from original
    try {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      // No audio or unsupported — continue without
    }

    // Target bitrate: scale down based on size
    const targetBitrate = Math.min(2_500_000, Math.max(800_000, (blob.size * 8) / video.duration / 2));

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
      videoBitsPerSecond: targetBitrate,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    const done = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        URL.revokeObjectURL(url);
        resolve(new Blob(chunks, { type: "video/webm" }));
      };
    });

    recorder.start();
    video.currentTime = 0;
    await video.play();

    const drawFrame = () => {
      if (video.ended || video.paused) {
        recorder.stop();
        return;
      }
      ctx.drawImage(video, 0, 0);
      requestAnimationFrame(drawFrame);
    };
    drawFrame();

    video.onended = () => recorder.stop();

    const result = await done;
    // If compression made it bigger, return original
    return result.size < blob.size ? result : blob;
  } catch (err) {
    console.warn("Video compression failed, using original:", err);
    return blob;
  }
};
