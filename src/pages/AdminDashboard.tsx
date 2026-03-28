import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Image as ImageIcon,
  Plus,
  LogOut,
  MoreVertical,
  Eye,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-event.jpg";

interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  coverImage: string;
  uploads: number;
  contributors: number;
}

const INITIAL_EVENTS: Event[] = [
  {
    id: "demo",
    name: "Class of 2026 Graduation",
    date: "2026-06-15",
    description: "Annual graduation ceremony",
    coverImage: heroImage,
    uploads: 47,
    contributors: 23,
  },
  {
    id: "conf-2026",
    name: "Tech Summit 2026",
    date: "2026-09-20",
    description: "Annual technology conference",
    coverImage: heroImage,
    uploads: 128,
    contributors: 64,
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", date: "", description: "" });

  const totalUploads = events.reduce((sum, e) => sum + e.uploads, 0);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: Event = {
      id: `evt-${Date.now()}`,
      name: newEvent.name,
      date: newEvent.date,
      description: newEvent.description,
      coverImage: heroImage,
      uploads: 0,
      contributors: 0,
    };
    setEvents([event, ...events]);
    setNewEvent({ name: "", date: "", description: "" });
    setDialogOpen(false);
    toast({ title: "Event created!", description: `"${event.name}" is ready to go.` });
  };

  const handleLogout = () => {
    localStorage.removeItem("mv_role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground">
            Moment<span className="text-gold">ique</span>
          </h1>
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gold" size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Create New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4 mt-2">
                  <Input
                    placeholder="Event name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="h-12 font-body"
                    required
                  />
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="h-12 font-body"
                    required
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="font-body"
                  />
                  <Button type="submit" variant="gold" size="lg" className="w-full py-5">
                    Create Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{events.length}</p>
            <p className="text-sm text-muted-foreground font-body">Total Events</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{totalUploads}</p>
            <p className="text-sm text-muted-foreground font-body">Total Uploads</p>
          </motion.div>
        </div>

        {/* Events */}
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Your Events</h2>
        <div className="space-y-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-xl border border-border overflow-hidden hover:border-gold/30 transition-colors"
            >
              <div className="flex">
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0">
                  <img
                    src={event.coverImage}
                    alt={event.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-foreground truncate">
                        {event.name}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0 -mr-2 -mt-1 h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/organizer/${event.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Manage Event
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/event/${event.id}`)}>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Guest View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-muted-foreground font-body">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground font-body mt-2">
                    <span className="flex items-center gap-1">
                      <Upload className="w-3 h-3" /> {event.uploads} uploads
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> {event.contributors} contributors
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;