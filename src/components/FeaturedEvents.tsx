import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import sampleGraduation from "@/assets/sample-graduation.jpg";
import sampleConference from "@/assets/sample-conference.jpg";
import sampleFestival from "@/assets/sample-festival.jpg";

const SAMPLE_EVENTS = [
  {
    id: "graduation-2026",
    name: "Class of 2026 Graduation",
    date: "2026-06-15",
    location: "Grand Auditorium",
    coverImage: sampleGraduation,
    uploads: 342,
  },
  {
    id: "tech-summit",
    name: "Tech Innovation Summit",
    date: "2026-04-20",
    location: "Convention Center",
    coverImage: sampleConference,
    uploads: 189,
  },
  {
    id: "music-fest",
    name: "Summer Music Festival",
    date: "2026-07-10",
    location: "Central Park",
    coverImage: sampleFestival,
    uploads: 578,
  },
];

interface FeaturedEventsProps {
  visible?: boolean;
}

const FeaturedEvents = ({ visible = true }: FeaturedEventsProps) => {
  if (!visible) return null;

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium gold-gradient text-primary-foreground mb-4">
            Live Now
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Featured Events
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            See what's happening — real events powered by Momentique.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SAMPLE_EVENTS.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl overflow-hidden bg-card border border-border hover:border-gold/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={event.coverImage}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={600}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium gold-gradient text-primary-foreground">
                    {event.uploads} uploads
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {event.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
