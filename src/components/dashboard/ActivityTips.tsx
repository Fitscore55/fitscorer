
import React from 'react';

interface ActivityTipsProps {
  tips?: string[];
}

const ActivityTips = ({ tips = [
  "You're just 1,258 steps away from your daily goal!",
  "Try taking a 10-minute walk after each meal.",
  "Join the \"10K Steps Challenge\" to compete with friends."
] }: ActivityTipsProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-fitscore-100/50 dark:bg-fitscore-900/20 rounded-bl-3xl" />
      <h3 className="text-lg font-semibold mb-3 relative">Activity Tips</h3>
      <ul className="list-disc list-inside space-y-2 text-sm relative">
        {tips.map((tip, index) => (
          <li key={index} className="transition-all hover:translate-x-1 hover:text-fitscore-600">
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityTips;
