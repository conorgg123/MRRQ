import React from 'react';
import { Clock, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  icon: LucideIcon;
  waitTime: string;
  playersInQueue: number;
  description: string;
}

interface RoleQueueProps {
  selectedRole: string | null;
  onRoleSelect: (role: string) => void;
  roles: Role[];
}

export const RoleQueue: React.FC<RoleQueueProps> = ({
  selectedRole,
  onRoleSelect,
  roles
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Select Your Role</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={`
              p-4 rounded-lg transition-all duration-200
              ${selectedRole === role.id
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            <div className="flex flex-col items-center text-center">
              <role.icon className="w-12 h-12 mb-3" />
              <h3 className="text-lg font-semibold mb-2">{role.name}</h3>
              <p className="text-sm text-gray-300 mb-4">{role.description}</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{role.waitTime}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{role.playersInQueue}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};