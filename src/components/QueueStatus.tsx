import React from 'react';
import { Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface QueueStatusProps {
  estimatedTime: string;
  playersInQueue: number;
  role: string;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({
  estimatedTime,
  playersInQueue,
  role
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-blue-400">Queue Status</h3>
        <div className="text-sm text-gray-400">Role: {role}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Estimated Wait</span>
          </div>
          <div className="text-2xl font-bold">{estimatedTime}</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">Players in Queue</span>
          </div>
          <div className="text-2xl font-bold">{playersInQueue}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear'
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};