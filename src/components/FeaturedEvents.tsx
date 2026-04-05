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
    fetchAllEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
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
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium gold-gradient text-primary-foreground mb-4">Live Now</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Featured Events</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">See what's happening — real events powered by Momentique.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayEvents.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group rounded-xl overflow-hidden bg-card border border-border hover:border-gold/30 hover:shadow-xl transition-all duration-300">
              <div className="relative h-44 overflow-hidden">
                {event.cover_image ? (
                  <img src={event.cover_image} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium gold-gradient text-primary-foreground">{event.uploads} uploads</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">{event.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-body mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.description || "Event Venue"}
                  </span>
                </div>
                <Button variant="gold-outline" size="sm" className="w-full" onClick={() => handleEventClick(event)}>
                  <Eye className="w-4 h-4 mr-1.5" /> View Event
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
