import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Image as ImageIcon, Video, X, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const MediaGallery = ({ extraMedia = [], canDelete = false, onDeleteMedia }: MediaGalleryProps) => {
  const [filter, setFilter] = useState<MediaType>("all");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // Only show extra media (no demo placeholders)
  const allMedia = extraMedia;

  const filtered = allMedia.filter((m) => {
    if (filter === "photos") return m.type === "image";
    if (filter === "videos") return m.type === "video";
    return true;
  });

  const selectedItem = allMedia.find((m) => m.id === selectedMedia);

  return (
    <div>
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {filtered.map((media, index) => (
          <motion.div
            key={media.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-muted"
            onClick={() => setSelectedMedia(media.id)}
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
            {canDelete && onDeleteMedia && (
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
      {selectedMedia && selectedItem && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-foreground/95 flex flex-col" onClick={() => setSelectedMedia(null)}>
          {/* Top bar */}
          <div className="flex items-center justify-between p-3 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              {canDelete && onDeleteMedia && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:bg-red-500/20"
                  onClick={() => { onDeleteMedia(selectedItem.id); setSelectedMedia(null); }}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a href={selectedItem.url} download onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                  <Download className="w-5 h-5" />
                </Button>
              </a>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setSelectedMedia(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Media */}
          <div className="flex-1 flex items-center justify-center p-4 relative" onClick={() => setSelectedMedia(null)}>
            {/* Nav arrows */}
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

          {/* Bottom info */}
          <div className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-primary-foreground/70 text-sm font-body">{selectedItem.uploaderName}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MediaGallery;
