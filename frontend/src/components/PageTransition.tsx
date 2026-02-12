import { motion } from "framer-motion";
import { type ReactNode } from "react";

/**
 * Wrapper component for animated page transitions
 * Uses Framer Motion for smooth fade and slide effects
 */
interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
