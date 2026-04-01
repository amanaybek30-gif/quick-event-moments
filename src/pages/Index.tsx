import { motion } from "framer-motion";
import { Camera, Upload, QrCode, Shield, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import FeaturedEvents from "@/components/FeaturedEvents";
import heroImage from "@/assets/hero-event.jpg";

const features = [
  {
    icon: QrCode,
    title: "QR Code Access",
    description: "Guests scan a QR code to instantly upload photos and videos — no app needed.",
  },
  {
    icon: Camera,
    title: "Crowd-Sourced Media",
    description: "Collect every angle and every moment from your entire audience.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for mobile and low bandwidth. Upload in seconds.",
  },
  {
    icon: Shield,
    title: "Secure & Organized",
    description: "All media stored safely, organized by event, ready to download.",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description: "Admins create events, organizers manage galleries, guests upload freely.",
  },
  {
    icon: Upload,
    title: "Bulk Download",
    description: "Download individual files or entire event galleries at once.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Event crowd capturing moments"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-16 md:mb-24">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-display font-bold text-primary-foreground"
            >
              Moment<span className="text-gold">ique</span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="gold-outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/admin/login")}
              >
                Admin Login
              </Button>
            </motion.div>
          </nav>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center pb-20 md:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium gold-gradient text-primary-foreground mb-6">
                Live Event Media Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-6 leading-tight"
            >
              Capture Every{" "}
              <span className="gold-gradient-text">Moment</span>
              <br />
              Together
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto font-body"
            >
              The easiest way to collect crowd-sourced photos and videos
              from your events. One QR code, unlimited memories.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <FeaturedEvents visible={true} />

      {/* Features */}
      <section className="py-20 md:py-28 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            A complete platform for collecting, managing, and sharing event media.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 md:p-8 rounded-xl bg-card border border-border hover:border-gold/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg gold-gradient flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Three Simple Steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Create Event", desc: "Admin creates an event and generates a QR code" },
              { step: "2", title: "Scan & Upload", desc: "Guests scan the QR code and upload instantly" },
              { step: "3", title: "Manage & Download", desc: "Organizers view, filter, and download all media" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4 text-2xl font-display font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground font-body">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-display font-bold text-foreground mb-1">
            Moment<span className="text-gold">ique</span>
          </h2>
          <p className="text-muted-foreground font-body text-xs mb-1">
            Powered by <span className="font-semibold">VION Events</span>
          </p>
          <p className="text-muted-foreground font-body text-sm">
            © {new Date().getFullYear()} Momentique. Capture every moment together.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;