import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Image as ImageIcon, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type MediaType = "all" | "photos" | "videos";

// Demo placeholder images
const DEMO_MEDIA = Array.from({ length: 12 }, (_, i) => ({
  id: `media-${i}`,
  url: `https://picsum.photos/seed/${i + 10}/400/400`,
  type: i % 4 === 0 ? ("video" as const) : ("image" as const),
  uploadedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
  uploaderName: ["Alex", "Jordan", "Sam", "Riley", "Casey", "Morgan"][i % 6],
}));

interface MediaGalleryProps {
  showDownload?: boolean;
}

const MediaGallery = ({ showDownload = false }: MediaGalleryProps) => {
  const [filter, setFilter] = useState<MediaType>("all");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const filtered = DEMO_MEDIA.filter((m) => {
    if (filter === "photos") return m.type === "image";
    if (filter === "videos") return m.type === "video";
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all" as const, label: "All", icon: Filter },
          { key: "photos" as const, label: "Photos", icon: ImageIcon },
          { key: "videos" as const, label: "Videos", icon: Video },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
            className="shrink-0"
          >
            <Icon className="w-4 h-4 mr-1.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {filtered.map((media, index) => (
          <motion.div
            key={media.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-muted"
            onClick={() => setSelectedMedia(media.id)}
          >
            <img
              src={media.url}
              alt={`Upload by ${media.uploaderName}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {media.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-foreground/60 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-primary-foreground font-body truncate">
                {media.uploaderName}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-body">No media found</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedMedia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={DEMO_MEDIA.find((m) => m.id === selectedMedia)?.url}
            alt="Full view"
            className="max-w-full max-h-[85vh] rounded-lg object-contain"
          />
        </motion.div>
      )}
    </div>
  );
};

export default MediaGallery;
