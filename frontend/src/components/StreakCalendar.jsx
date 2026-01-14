import { useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { IconCalendar, IconFlame, IconTrendingUp } from '@tabler/icons-react';

/**
 * GitHub-style activity heatmap showing submission history
 */
const StreakCalendar = ({ submissions = [], showStats = true }) => {
  // Transform submissions into calendar data format
  const { calendarData, currentStreak, longestStreak, totalDays } = useMemo(() => {
    // Create a map of date -> count
    const dateCountMap = {};
    
    submissions.forEach((submission) => {
      const date = new Date(submission.createdAt).toISOString().split("T")[0];
      dateCountMap[date] = (dateCountMap[date] || 0) + 1;
    });

    // Generate data for the last 365 days
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const data = [];
    const currentDate = new Date(oneYearAgo);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = dateCountMap[dateStr] || 0;
      
      // Level: 0 = none, 1-4 based on count
      let level = 0;
      if (count > 0) {
        if (count <= 2) level = 1;
        else if (count <= 5) level = 2;
        else if (count <= 10) level = 3;
        else level = 4;
      }
      
      data.push({
        date: dateStr,
        count,
        level,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate streaks
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let total = 0;

    // Sort dates in reverse order for streak calculation
    const sortedDates = Object.keys(dateCountMap).sort().reverse();
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split("T")[0];

    // Check if there's activity today or yesterday for current streak
    let checkDate = new Date(today);
    let isCurrentStreak = true;

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dateCountMap[dateStr]) {
        if (isCurrentStreak) current++;
        tempStreak++;
        total++;
      } else {
        if (isCurrentStreak && i > 0) isCurrentStreak = false;
        longest = Math.max(longest, tempStreak);
        tempStreak = 0;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    longest = Math.max(longest, tempStreak);

    return {
      calendarData: data,
      currentStreak: current,
      longestStreak: longest,
      totalDays: total,
    };
  }, [submissions]);

  // Custom theme matching DaisyUI colors
  const theme = {
    light: ["#e5e7eb", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      {showStats && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-base-200/50 rounded-xl">
            <IconFlame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold">{currentStreak}</span>
            <span className="text-xs text-base-content/60">day streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-base-200/50 rounded-xl">
            <IconTrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-bold">{longestStreak}</span>
            <span className="text-xs text-base-content/60">longest</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-base-200/50 rounded-xl">
            <IconCalendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">{totalDays}</span>
            <span className="text-xs text-base-content/60">active days</span>
          </div>
        </div>
      )}

      {/* Activity IconCalendar */}
      <div className="overflow-x-auto pb-2">
        <ActivityCalendar
          data={calendarData}
          theme={theme}
          colorScheme="dark"
          blockSize={12}
          blockMargin={3}
          blockRadius={2}
          fontSize={12}
          labels={{
            totalCount: "{{count}} submissions in the last year",
          }}
          showWeekdayLabels
          maxLevel={4}
          renderBlock={(block, activity) => (
            <rect
              {...block}
              rx={2}
              ry={2}
              data-tip={`${activity.count} submission${activity.count !== 1 ? "s" : ""} on ${activity.date}`}
              className="cursor-pointer hover:stroke-primary hover:stroke-2 transition-all"
            />
          )}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-base-content/60">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  level === 0
                    ? "#161b22"
                    : level === 1
                    ? "#0e4429"
                    : level === 2
                    ? "#006d32"
                    : level === 3
                    ? "#26a641"
                    : "#39d353",
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default StreakCalendar;
