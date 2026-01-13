import { Pause, Play, RotateCcw } from 'lucide-react';

interface GameUIProps {
  isPlaying: boolean;
  onPause: () => void;
  onRestart: () => void;
}

export function GameUI({ isPlaying, onPause, onRestart }: GameUIProps) {
  return (
    <div className="absolute top-4 left-4 z-20">
      <div className="flex items-center gap-2">
        <button
          onClick={onPause}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-lg"
          title={isPlaying ? 'Pause' : 'Reprendre'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        
        <button
          onClick={onRestart}
          className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-lg"
          title="Recommencer"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
