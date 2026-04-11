import { motion } from "framer-motion";
import { Camera, Upload, QrCode, Shield, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import FeaturedEvents from "@/components/FeaturedEvents";
import heroImage from "@/assets/hero-event.jpg";
import contactBg from "@/assets/contact-bg.jpg";
import { Mail, Phone } from "lucide-react";
import QrScannerFab from "@/components/QrScannerFab";

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

        <div className="relative z-10 container mx-auto px-4 py-6 md:py-8">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-10 md:mb-24">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl md:text-2xl font-display font-bold text-primary-foreground"
            >
              Moment<span className="text-gold">ique</span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="gold-outline"
                size="sm"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-xs md:text-sm"
                onClick={() => navigate("/admin/login")}
              >
                Admin Login
              </Button>
            </motion.div>
          </nav>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center pb-14 md:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium gold-gradient text-primary-foreground mb-4 md:mb-6">
                Live Event Media Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-4 md:mb-6 leading-tight"
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
              className="text-sm md:text-xl text-primary-foreground/80 max-w-xl mx-auto font-body px-2"
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
      <section className="py-12 md:py-28 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-2 md:mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-body">
            A complete platform for collecting, managing, and sharing event media.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-4 md:p-8 rounded-xl bg-card border border-border hover:border-gold/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg gold-gradient flex items-center justify-center mb-3 md:mb-5">
                <feature.icon className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <h3 className="text-sm md:text-xl font-display font-semibold text-foreground mb-1 md:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs md:text-base text-muted-foreground font-body leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-2 md:mb-4">
              Three Simple Steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-8 max-w-4xl mx-auto">
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
                <div className="w-11 h-11 md:w-16 md:h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-2 md:mb-4 text-lg md:text-2xl font-display font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-xs md:text-xl font-display font-semibold text-foreground mb-1 md:mb-2">
                  {item.title}
                </h3>
                <p className="text-[10px] md:text-base text-muted-foreground font-body leading-snug">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="relative overflow-hidden py-12 md:py-28">
        <div className="absolute inset-0">
          <img
            src={contactBg}
            alt="Event venue ambiance"
            className="w-full h-full object-cover blur-sm scale-105"
            loading="lazy"
            width={1920}
            height={800}
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold text-primary-foreground mb-3 md:mb-4">
              Make Your Guests Part of the Story
            </h2>
            <p className="text-primary-foreground/80 text-sm md:text-lg max-w-2xl mx-auto font-body mb-6 md:mb-10 px-2">
              We'll set up Momentique for your event so every guest can capture and share the moments that matter — effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="gold"
                size="default"
                className="gap-2 text-sm md:text-base w-full sm:w-auto"
                onClick={() => window.location.href = "mailto:eventcoordinator@vionevents.com"}
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                Send Us an Email
              </Button>
              <Button
                variant="gold-outline"
                size="default"
                className="gap-2 text-sm md:text-base border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
                onClick={() => window.location.href = "tel:+251944010908"}
              >
                <Phone className="w-4 h-4 md:w-5 md:h-5" />
                +251 944 010 908
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-10 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-1">
            Moment<span className="text-gold">ique</span>
          </h2>
          <p className="text-muted-foreground font-body text-[10px] md:text-xs mb-1">
            Powered by <span className="font-semibold">VION Events</span>
          </p>
          <p className="text-muted-foreground font-body text-xs md:text-sm">
            © {new Date().getFullYear()} Momentique. Capture every moment together.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
