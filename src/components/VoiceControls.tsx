import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';

interface VoiceControlsProps {
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  volume: number;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onVolumeChange: (volume: number) => void;
  onOpenSettings: () => void;
}

export function VoiceControls({
  isMuted,
  isDeafened,
  isSpeaking,
  volume,
  onToggleMute,
  onToggleDeafen,
  onVolumeChange,
  onOpenSettings
}: VoiceControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
      <button
        onClick={onToggleMute}
        className={`p-2 rounded-lg transition ${
          isMuted
            ? 'bg-red-500 hover:bg-red-600'
            : isSpeaking
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-600 hover:bg-gray-500'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={onToggleDeafen}
        className={`p-2 rounded-lg transition ${
          isDeafened
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gray-600 hover:bg-gray-500'
        }`}
        title={isDeafened ? 'Undeafen' : 'Deafen'}
      >
        {isDeafened ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        title="Volume"
      />

      <button
        onClick={onOpenSettings}
        className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
        title="Voice Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}