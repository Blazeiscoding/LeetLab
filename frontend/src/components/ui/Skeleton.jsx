/**
 * Reusable skeleton loading components
 * Used to show content placeholders during data fetching
 */

// Base skeleton with animation
export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-base-300/50 rounded ${className}`} />
);

// Text line skeleton
export const SkeletonText = ({ lines = 1, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-base-300/50 rounded animate-pulse ${
          i === lines - 1 ? "w-3/4" : "w-full"
        }`}
      />
    ))}
  </div>
);

// Avatar skeleton
export const SkeletonAvatar = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-base-300/50 animate-pulse`}
    />
  );
};

// Card skeleton for problem cards
export const SkeletonCard = () => (
  <div className="card bg-base-100 shadow-sm border border-base-content/5 p-5">
    <div className="flex items-center gap-4">
      <div className="w-1.5 h-16 bg-base-300/50 rounded-full animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// Table row skeleton
export const SkeletonTableRow = ({ columns = 4 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Stats card skeleton
export const SkeletonStats = () => (
  <div className="bg-base-100/80 backdrop-blur-md rounded-2xl p-4 border border-base-content/5 shadow-sm">
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

// Problem list skeleton
export const SkeletonProblemList = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Profile header skeleton
export const SkeletonProfileHeader = () => (
  <div className="relative bg-base-100/80 backdrop-blur-xl rounded-3xl shadow-xl mb-8 overflow-hidden border border-base-content/5 p-8 lg:p-10">
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
      <SkeletonAvatar size="lg" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <SkeletonStats />
        <SkeletonStats />
        <SkeletonStats />
      </div>
    </div>
  </div>
);

// Dashboard stats skeleton
export const SkeletonDashboardStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonStats key={i} />
    ))}
  </div>
);
