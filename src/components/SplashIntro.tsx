import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import heroImage from "@/assets/hero-event.jpg";

const SPLASH_KEY = "mv_splash_shown";

const letters = "Momentique".split("");

const SplashIntro = () => {
  const [show, setShow] = useState(() => sessionStorage.getItem(SPLASH_KEY) !== "1");

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem(SPLASH_KEY, "1");
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <motion.img
            src={heroImage}
            alt="Guests capturing moments at an event"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-foreground/90" />

          <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-block px-3 py-1 rounded-full text-[11px] tracking-[0.2em] uppercase gold-gradient text-primary-foreground mb-5"
            >
              Live Event Media
            </motion.span>

            <h1 className="text-4xl font-display font-bold flex overflow-hidden">
              {letters.map((l, i) => (
                <motion.span
                  key={`${l}-${i}`}
                  initial={{ opacity: 0, y: 40, rotateX: -90, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: "easeOut" }}
                  className={i > 5 ? "text-gold" : "text-primary-foreground"}
                >
                  {l}
                </motion.span>
              ))}
            </h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="h-px w-32 gold-gradient my-5 origin-center"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="text-primary-foreground/80 font-body text-sm max-w-xs"
            >
              Capture every moment, together.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashIntro;
