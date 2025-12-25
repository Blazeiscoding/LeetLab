import React from 'react';
import { getDifficultyColor } from '../../utils/difficulty';
import { formatActivityDate } from '../../utils/formatters';

/**
 * Reusable submission card component
 * Displays a single submission with problem title, language, difficulty, and status
 */
const SubmissionCard = ({ submission, className = '' }) => {
  const isAccepted = submission.status === 'Accepted';

  return (
    <div className={`group p-4 bg-base-200/30 rounded-xl border border-base-content/5 hover:bg-base-200/60 transition-colors ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-sm truncate mb-1 group-hover:text-primary transition-colors">
            {submission.problemTitle}
          </h5>
          <div className="flex items-center gap-2 text-xs">
            <span className="badge badge-sm badge-ghost font-mono">
              {submission.language}
            </span>
            {submission.problemDifficulty && (
              <span className={`font-bold ${getDifficultyColor(submission.problemDifficulty)}`}>
                {submission.problemDifficulty}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`badge badge-sm font-semibold mb-1 ${
            isAccepted ? 'badge-success gap-1' : 'badge-error gap-1'
          }`}>
            {isAccepted ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                AC
              </>
            ) : 'WA'}
          </div>
          <p className="text-[10px] text-base-content/40 font-medium">
            {formatActivityDate(submission.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Empty state for no submissions
 */
export const NoSubmissions = ({ onStartCoding }) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
      <div className="p-4 bg-base-200/50 rounded-full mb-4">
        <svg className="w-8 h-8 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <h4 className="font-bold mb-2">No activity yet</h4>
      <p className="text-sm text-base-content/60 mb-6 max-w-[200px]">
        Start solving problems to see your history here
      </p>
      {onStartCoding && (
        <button onClick={onStartCoding} className="btn btn-primary btn-sm">
          Start Now
        </button>
      )}
    </div>
  );
};

export default SubmissionCard;
