import { motion } from "framer-motion";

/**
 * Wrapper component for animated page transitions
 * Uses Framer Motion for smooth fade and slide effects
 */
const PageTransition = ({ children }) => {
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
