import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Lock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchAllEvents, type EventData } from "@/lib/eventService";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedEventsProps {
  visible?: boolean;
}

const FeaturedEvents = ({ visible = true }: FeaturedEventsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const load = () => fetchAllEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
    load();

    const channel = supabase
      .channel("homepage-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [visible]);

  if (!visible) return null;

  const displayEvents = events.slice(0, 6);

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-body">Loading events...</p>
        </div>
      </section>
    );
  }

  if (displayEvents.length === 0) return null;

  const handleEventClick = (event: EventData) => {
    setSelectedEvent(event);
    setPasswordInput("");
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (passwordInput === selectedEvent.password) {
      setPasswordDialogOpen(false);
      sessionStorage.setItem(`organizer_auth_${selectedEvent.id}`, "true");
      navigate(`/organizer/${selectedEvent.id}`);
    } else {
      toast({ title: "Wrong password", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <section className="py-12 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 md:mb-12">
          <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium gold-gradient text-primary-foreground mb-3 md:mb-4">Live Now</span>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-2 md:mb-3">Featured Events</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-body">See what's happening — real events powered by Momentique.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto">
          {displayEvents.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group rounded-xl overflow-hidden bg-card border border-border hover:border-gold/30 hover:shadow-xl transition-all duration-300">
              <div className="relative h-28 md:h-44 overflow-hidden">
                {event.cover_image ? (
                  <img src={event.cover_image} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3">
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium gold-gradient text-primary-foreground">{event.uploads} uploads</span>
                </div>
              </div>
              <div className="p-3 md:p-4">
                <h3 className="text-sm md:text-lg font-display font-semibold text-foreground mb-1 md:mb-2 truncate">{event.name}</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-[10px] md:text-sm text-muted-foreground font-body mb-2 md:mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                    {event.description || "Event Venue"}
                  </span>
                </div>
                <Button variant="gold-outline" size="sm" className="w-full text-xs md:text-sm h-8 md:h-9" onClick={() => handleEventClick(event)}>
                  <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" /> View Event
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">{selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground font-body text-sm mb-2">Enter the event password to access</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="password" placeholder="Event password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="pl-10 h-12 font-body" required autoFocus />
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full py-5">Access Event</Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FeaturedEvents;
