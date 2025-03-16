interface SpeedMeterProps {
  progress: number;
  currentSpeed: number;
  testing: boolean;
}

export default function SpeedMeter({
  progress,
  currentSpeed,
  testing,
}: SpeedMeterProps) {
  return (
    <>
      <div className="relative flex justify-center items-center">
        {/* Loading Spinner */}
        {testing && (
          <div className="absolute">
            <div className="w-24 h-24 border-4 border-blue-500 rounded-full animate-spin border-t-transparent" />
          </div>
        )}

        {/* Speed Display */}
        <div className="text-center p-3">
          <div className="text-3xl font-bold">{currentSpeed.toFixed(1)}</div>
          <div className="text-xl text-blue-500">Mbps</div>
        </div>
      </div>
    </>
  );
}
