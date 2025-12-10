import React from "react";

const Loader = ({ size = "lg" }) => {
  // Map size prop to pixel values or tailwind classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const containerSize = sizeClasses[size] || sizeClasses.lg;

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className={`relative ${containerSize}`}>
        <img
          src="/Loader.svg"
          alt="Loading..."
          className="w-full h-full object-contain animate-spin"
        />
      </div>
    </div>
  );
};

export default Loader;
