
import React from 'react';
import { PlayerStats } from '../types';
import { ShieldCheckIcon, UserGroupIcon, ScaleIcon, MegaphoneIcon, HeartIcon } from '@heroicons/react/24/outline';


interface StatsDisplayProps {
  stats: PlayerStats;
}

const StatItem: React.FC<{ icon: React.ReactNode, label: string, value: number, barColor: string }> = ({ icon, label, value, barColor }) => (
  <div className="bg-gray-700 p-3 rounded-lg shadow">
    <div className="flex items-center mb-1">
      <span className="w-6 h-6 mr-2 text-blue-400">{icon}</span>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </div>
    <div className="w-full bg-gray-600 rounded-full h-2.5">
      <div
        className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
    <p className="text-right text-xs text-gray-400 mt-1">{value}/100</p>
  </div>
);


const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  const getBarColor = (value: number): string => {
    if (value < 25) return 'bg-red-500';
    if (value < 50) return 'bg-yellow-500';
    if (value < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 bg-gray-800 rounded-lg shadow-lg mb-6">
      <StatItem icon={<ShieldCheckIcon />} label="İtibar" value={stats.itibar} barColor={getBarColor(stats.itibar)} />
      <StatItem icon={<UserGroupIcon />} label="Parti Gücü" value={stats.partiGucu} barColor={getBarColor(stats.partiGucu)} />
      <StatItem icon={<ScaleIcon />} label="Etik" value={stats.etik} barColor={getBarColor(stats.etik)} />
      <StatItem icon={<MegaphoneIcon />} label="Medya" value={stats.medya} barColor={getBarColor(stats.medya)} />
      <StatItem icon={<HeartIcon />} label="Moral" value={stats.moral} barColor={getBarColor(stats.moral)} />
    </div>
  );
};

export default StatsDisplay;