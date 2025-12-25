import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Sparkles Background - Aceternity UI inspired
 * Creates animated sparkle particles
 */
export const SparklesCore = ({
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 100,
  particleColor = "#FFF",
  className = "",
}) => {
  const particles = React.useMemo(() => {
    return Array.from({ length: particleDensity }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 2,
    }));
  }, [particleDensity, minSize, maxSize]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background }}
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particleColor,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/**
 * Spotlight Effect - Aceternity UI inspired
 */
export const Spotlight = ({ className = "", fill = "white" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%" }}
      animate={{ opacity: 1, scale: 1, x: "-50%", y: "-40%" }}
      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
      className={`pointer-events-none absolute left-1/2 top-0 z-0 ${className}`}
    >
      <svg
        className="h-[80vh] w-[80vw] opacity-30"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="500"
          cy="200"
          rx="500"
          ry="400"
          fill={`url(#spotlight-gradient-${fill})`}
        />
        <defs>
          <radialGradient
            id={`spotlight-gradient-${fill}`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(500 200) rotate(90) scale(400 500)"
          >
            <stop stopColor={fill} stopOpacity="0.3" />
            <stop offset="1" stopColor={fill} stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

/**
 * Text Generate Effect - Aceternity UI inspired
 */
export const TextGenerateEffect = ({ words, className = "", duration = 0.5 }) => {
  const wordsArray = words.split(" ");

  return (
    <motion.div className={className}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: duration,
            delay: idx * 0.1,
            ease: "easeOut",
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

/**
 * Flip Words Effect - Aceternity UI inspired
 */
export const FlipWords = ({ words, duration = 3000, className = "" }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <span className={`relative inline-block ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={word}
          className="absolute left-0"
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            y: index === currentIndex ? 0 : -20,
            rotateX: index === currentIndex ? 0 : 90,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: "center" }}
        >
          {word}
        </motion.span>
      ))}
      <span className="invisible">{words[0]}</span>
    </span>
  );
};

/**
 * Moving Border Button - Aceternity UI inspired
 */
export const MovingBorder = ({
  children,
  duration = 2000,
  className = "",
  containerClassName = "",
  borderRadius = "1.5rem",
  ...props
}) => {
  return (
    <div
      className={`relative overflow-hidden p-[1px] ${containerClassName}`}
      style={{ borderRadius }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, transparent 50%, hsl(var(--p)) 50%, transparent 60%, transparent)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div
        className={`relative bg-base-100 ${className}`}
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 3D Card Effect - Aceternity UI inspired
 */
export const Card3D = ({ children, className = "" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

/**
 * Professional Gradient Background - Clean and minimal
 * Uses subtle gradient mesh instead of blobs
 */
export const GlowingBackground = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Top gradient accent - very subtle */}
      <div 
        className="absolute top-0 left-0 right-0 h-[500px]"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--p) / 0.08), transparent)',
        }}
      />
      {/* Bottom gradient accent */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[300px]"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 120%, hsl(var(--s) / 0.05), transparent)',
        }}
      />
    </div>
  );
};

/**
 * Grid Background Pattern
 */
export const GridBackground = ({ className = "" }) => {
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, hsl(var(--bc) / 0.03) 1px, transparent 1px),
                          linear-gradient(to bottom, hsl(var(--bc) / 0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  );
};

/**
 * Bento Grid Item
 */
export const BentoGridItem = ({
  title,
  description,
  icon: Icon,
  className = "",
  children,
}) => {
  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl bg-base-100 border border-base-content/5 p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-xl ${className}`}
      whileHover={{ y: -4 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        {Icon && (
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
            <Icon className="w-6 h-6" />
          </div>
        )}
        {title && (
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-base-content/60">{description}</p>
        )}
        {children}
      </div>
    </motion.div>
  );
};
