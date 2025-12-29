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

// Code editor skeleton - mimics Monaco editor loading state
export const SkeletonCodeEditor = ({ height = "300px" }) => (
  <div 
    className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-base-content/10"
    style={{ height }}
  >
    {/* Editor header bar */}
    <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
      </div>
      <Skeleton className="h-4 w-24 ml-4 bg-[#3c3c3c]" />
    </div>
    {/* Line numbers + code lines */}
    <div className="p-4 space-y-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="text-[#858585] text-xs font-mono w-6 text-right">{i + 1}</span>
          <Skeleton 
            className={`h-4 bg-[#3c3c3c] ${
              i === 0 ? 'w-32' : 
              i === 1 ? 'w-48' : 
              i === 2 ? 'w-24' :
              i === 3 ? 'w-56' :
              i === 4 ? 'w-40' :
              i === 5 ? 'w-20' :
              i === 6 ? 'w-64' :
              i === 7 ? 'w-36' :
              i === 8 ? 'w-28' :
              i === 9 ? 'w-52' :
              i === 10 ? 'w-16' :
              'w-44'
            }`} 
          />
        </div>
      ))}
    </div>
  </div>
);

// Leaderboard skeleton
export const SkeletonLeaderboard = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div 
        key={i} 
        className={`flex items-center gap-4 p-4 rounded-xl bg-base-100 border border-base-content/5 ${
          i === 0 ? 'ring-2 ring-yellow-500/20' : ''
        }`}
      >
        {/* Rank */}
        <div className="w-8 h-8 rounded-full bg-base-300/50 animate-pulse flex items-center justify-center">
          <span className="text-sm font-bold text-base-content/30">{i + 1}</span>
        </div>
        {/* Avatar */}
        <SkeletonAvatar size="md" />
        {/* Name and stats */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        {/* Score */}
        <div className="text-right space-y-1">
          <Skeleton className="h-6 w-16 ml-auto" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

// Submission card skeleton
export const SkeletonSubmissionCard = () => (
  <div className="flex items-center justify-between p-4 bg-base-100 rounded-xl border border-base-content/5">
    <div className="flex items-center gap-4">
      {/* Status icon */}
      <Skeleton className="w-10 h-10 rounded-lg" />
      {/* Problem info */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    {/* Status badge */}
    <Skeleton className="h-6 w-20 rounded-full" />
  </div>
);

// Submission list skeleton
export const SkeletonSubmissionList = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonSubmissionCard key={i} />
    ))}
  </div>
);

// Problem detail page skeleton
export const SkeletonProblemDetail = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
    {/* Left panel - Problem description */}
    <div className="bg-base-100 rounded-xl border border-base-content/5 p-6 space-y-6">
      {/* Title and badges */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      {/* Description */}
      <div className="space-y-3">
        <SkeletonText lines={4} />
      </div>
      {/* Examples */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <div className="bg-base-200 rounded-lg p-4 space-y-2">
          <SkeletonText lines={3} />
        </div>
      </div>
      {/* Constraints */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <SkeletonText lines={2} />
      </div>
    </div>
    {/* Right panel - Code editor */}
    <div className="space-y-4">
      {/* Language selector */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      {/* Editor */}
      <SkeletonCodeEditor height="400px" />
      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  </div>
);
