import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Image as ImageIcon, Video, X, Trash2, ChevronLeft, ChevronRight, Save, Share2, CheckSquare, Square, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type MediaType = "all" | "photos" | "videos";

interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  uploadedAt: string;
  uploaderName: string;
}

interface MediaGalleryProps {
  showDownload?: boolean;
  extraMedia?: MediaItem[];
  canDelete?: boolean;
  onDeleteMedia?: (mediaId: string) => void;
}

const getFileExtensionFromUrl = (url: string, type: "image" | "video") => {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();
    if (ext) return ext;
  } catch {}
  return type === "video" ? "mp4" : "jpg";
};

const fetchAsBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  return response.blob();
};

const saveToDevice = async (url: string, filename: string) => {
  try {
    const blob = await fetchAsBlob(url);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.success("Saved to device!");
  } catch {
    toast.error("Could not save, try again");
  }
};

/**
 * Uses the Web Share API to share files natively on iOS/Android.
 * Falls back to download if sharing is not supported.
 */
const shareFiles = async (items: MediaItem[]) => {
  try {
    const files: File[] = [];
    for (const item of items) {
      const blob = await fetchAsBlob(item.url);
      const ext = getFileExtensionFromUrl(item.url, item.type);
      const mimeType = item.type === "video" ? `video/${ext}` : `image/${ext === "jpg" ? "jpeg" : ext}`;
      files.push(new File([blob], `momentique-${item.id}.${ext}`, { type: mimeType }));
    }

    if (navigator.share && navigator.canShare?.({ files })) {
      await navigator.share({ files, title: "Momentique" });
      toast.success("Shared!");
    } else {
      // Fallback: download each
      for (const item of items) {
        const ext = getFileExtensionFromUrl(item.url, item.type);
        await saveToDevice(item.url, `momentique-${item.id}.${ext}`);
      }
    }
  } catch (err: any) {
    if (err?.name === "AbortError") return; // user cancelled
    toast.error("Could not share, try again");
  }
};

/**
 * On iOS Safari, using the Web Share API with a single file triggers the native share sheet
 * which includes "Save Image" — this saves directly to the Photos gallery (not Files).
 * For multiple files we share them all at once.
 */
const saveToGalleryViaShare = async (items: MediaItem[]) => {
  try {
    const files: File[] = [];
    for (const item of items) {
      const blob = await fetchAsBlob(item.url);
      const ext = getFileExtensionFromUrl(item.url, item.type);
      const mimeType = item.type === "video" ? `video/${ext}` : `image/${ext === "jpg" ? "jpeg" : ext}`;
      files.push(new File([blob], `momentique-${item.id}.${ext}`, { type: mimeType }));
    }

    if (navigator.share && navigator.canShare?.({ files })) {
      await navigator.share({ files, title: "Save to Photos" });
      toast.success("Done! Use 'Save Image' to save to your gallery.");
    } else {
      // Fallback to anchor download
      for (const item of items) {
        const ext = getFileExtensionFromUrl(item.url, item.type);
        await saveToDevice(item.url, `momentique-${item.id}.${ext}`);
      }
    }
  } catch (err: any) {
    if (err?.name === "AbortError") return;
    toast.error("Could not save, try again");
  }
};

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const MediaGallery = ({ extraMedia = [], canDelete = false, onDeleteMedia }: MediaGalleryProps) => {
  const [filter, setFilter] = useState<MediaType>("all");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const longPressTimerRef = useRef<number | null>(null);

  const allMedia = extraMedia;

  const filtered = allMedia.filter((m) => {
    if (filter === "photos") return m.type === "image";
    if (filter === "videos") return m.type === "video";
    return true;
  });

  const selectedItem = allMedia.find((m) => m.id === selectedMedia);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map((m) => m.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const getSelectedItems = () => allMedia.filter((m) => selectedIds.has(m.id));

  const handleLongPressStart = (id: string) => {
    longPressTimerRef.current = window.setTimeout(() => {
      setSelectionMode(true);
      setSelectedIds(new Set([id]));
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleThumbnailClick = (media: MediaItem) => {
    if (selectionMode) {
      toggleSelection(media.id);
    } else {
      setSelectedMedia(media.id);
    }
  };

  const handleBulkSave = async () => {
    const items = getSelectedItems();
    if (items.length === 0) return;
    if (isIOS()) {
      await saveToGalleryViaShare(items);
    } else {
      for (const item of items) {
        const ext = getFileExtensionFromUrl(item.url, item.type);
        await saveToDevice(item.url, `momentique-${item.id}.${ext}`);
      }
    }
  };

  const handleBulkShare = async () => {
    const items = getSelectedItems();
    if (items.length === 0) return;
    await shareFiles(items);
  };

  const handleBulkDelete = () => {
    if (!onDeleteMedia) return;
    const ids = Array.from(selectedIds);
    ids.forEach((id) => onDeleteMedia(id));
    exitSelectionMode();
  };

  const allSelected = filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id));

  return (
    <div>
      {/* Selection mode toolbar */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between bg-card border border-border rounded-xl p-3 mb-4"
          >
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={exitSelectionMode}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <span className="text-sm text-muted-foreground font-body">
                {selectedIds.size} selected
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={allSelected ? deselectAll : selectAll}
                title={allSelected ? "Deselect all" : "Select all"}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectionMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-3 flex items-center justify-center gap-3"
          >
            <Button variant="gold" size="sm" onClick={handleBulkSave}>
              <Save className="w-4 h-4 mr-1.5" />
              {isIOS() ? "Save to Photos" : "Save"}
            </Button>
            <Button variant="gold-outline" size="sm" onClick={handleBulkShare}>
              <Share2 className="w-4 h-4 mr-1.5" /> Share
            </Button>
            {canDelete && onDeleteMedia && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all" as const, label: "All", icon: Filter },
          { key: "photos" as const, label: "Photos", icon: ImageIcon },
          { key: "videos" as const, label: "Videos", icon: Video },
        ].map(({ key, label, icon: Icon }) => (
          <Button key={key} variant={filter === key ? "gold" : "outline"} size="sm" onClick={() => setFilter(key)} className="shrink-0">
            <Icon className="w-4 h-4 mr-1.5" /> {label}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 ${selectionMode && selectedIds.size > 0 ? "pb-20" : ""}`}>
        {filtered.map((media, index) => (
          <motion.div
            key={media.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-muted ${selectionMode && selectedIds.has(media.id) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
            onClick={() => handleThumbnailClick(media)}
            onPointerDown={() => handleLongPressStart(media.id)}
            onPointerUp={handleLongPressEnd}
            onPointerLeave={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            {media.type === "video" ? (
              <video src={media.url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={media.url} alt={`Upload by ${media.uploaderName}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            )}
            {media.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-foreground/60 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-primary-foreground font-body truncate">{media.uploaderName}</p>
            </div>
            {/* Selection checkbox */}
            {selectionMode && (
              <div className="absolute top-2 left-2 z-10">
                {selectedIds.has(media.id) ? (
                  <CheckSquare className="w-6 h-6 text-primary drop-shadow-lg" />
                ) : (
                  <Square className="w-6 h-6 text-white/80 drop-shadow-lg" />
                )}
              </div>
            )}
            {!selectionMode && canDelete && onDeleteMedia && (
              <button
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onDeleteMedia(media.id); }}
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-body">No media yet. Moments will appear here once captured.</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedMedia && selectedItem && !selectionMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-foreground/95 flex flex-col" onClick={() => setSelectedMedia(null)}>
          <div className="flex items-center justify-between p-3 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              {canDelete && onDeleteMedia && (
                <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20" onClick={() => { onDeleteMedia(selectedItem.id); setSelectedMedia(null); }}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => shareFiles([selectedItem])}
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => {
                  if (isIOS()) {
                    saveToGalleryViaShare([selectedItem]);
                  } else {
                    const ext = getFileExtensionFromUrl(selectedItem.url, selectedItem.type);
                    saveToDevice(selectedItem.url, `momentique-${selectedItem.id}.${ext}`);
                  }
                }}
              >
                <Save className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setSelectedMedia(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 relative" onClick={() => setSelectedMedia(null)}>
            {filtered.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = filtered.findIndex((m) => m.id === selectedMedia);
                    const prev = idx > 0 ? idx - 1 : filtered.length - 1;
                    setSelectedMedia(filtered[prev].id);
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = filtered.findIndex((m) => m.id === selectedMedia);
                    const next = idx < filtered.length - 1 ? idx + 1 : 0;
                    setSelectedMedia(filtered[next].id);
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {selectedItem.type === "video" ? (
              <video src={selectedItem.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg" onClick={(e) => e.stopPropagation()} />
            ) : (
              <img src={selectedItem.url} alt="Full view" className="max-w-full max-h-[80vh] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
            )}
          </div>

          <div className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-primary-foreground/70 text-sm font-body">{selectedItem.uploaderName}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MediaGallery;
