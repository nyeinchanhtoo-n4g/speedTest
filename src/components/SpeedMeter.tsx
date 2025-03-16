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
    <div className="relative flex flex-col items-center">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-purple-500 rounded-full blur-[120px] opacity-20" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-blue-500 rounded-full blur-[120px] opacity-20" />
        <div className="absolute top-1/2 right-1/3 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-cyan-500 rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Main Speed Display */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          {testing ? (
            // Animated Testing Icon with Enhanced Effects
            <div className="relative">
              {/* Outer Glow Rings */}
              <div className="absolute inset-0 animate-ping opacity-20 rounded-full bg-cyan-400" />
              <div className="absolute inset-2 animate-ping opacity-10 rounded-full bg-purple-400 animation-delay-150" />
              <div className="absolute inset-4 animate-ping opacity-5 rounded-full bg-blue-400 animation-delay-300" />

              {/* Main Rotating Ring */}
              <div className="relative">
                <svg
                  className="w-48 h-48 animate-spin-slow"
                  viewBox="0 0 100 100"
                >
                  {/* Enhanced Gradient definitions */}
                  <defs>
                    <linearGradient
                      id="gradient1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: '#6366f1', stopOpacity: 1 }}
                      />
                      <stop
                        offset="50%"
                        style={{ stopColor: '#8b5cf6', stopOpacity: 1 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: '#06b6d4', stopOpacity: 1 }}
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradient2"
                      x1="100%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: '#6366f1', stopOpacity: 0.5 }}
                      />
                      <stop
                        offset="50%"
                        style={{ stopColor: '#8b5cf6', stopOpacity: 0.5 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: '#06b6d4', stopOpacity: 0.5 }}
                      />
                    </linearGradient>
                  </defs>

                  {/* Rotating segments with double lines for depth */}
                  {[...Array(12)].map((_, i) => (
                    <g key={i} transform={`rotate(${i * 30} 50 50)`}>
                      <line
                        x1="50"
                        y1="12"
                        x2="50"
                        y2="22"
                        stroke="url(#gradient1)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{ opacity: 1 - i * 0.07 }}
                      />
                      <line
                        x1="50"
                        y1="10"
                        x2="50"
                        y2="20"
                        stroke="url(#gradient2)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{ opacity: 0.5 - i * 0.03 }}
                      />
                    </g>
                  ))}
                </svg>

                {/* Centered Speed Icon with Glassmorphism */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 transform hover:scale-105 transition-transform">
                    <svg
                      className="w-14 h-14 text-cyan-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Enhanced Static Ready State
            <div className="relative transform transition-all duration-500 hover:scale-105">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-0.5 animate-gradient-xy">
                <div className="w-full h-full rounded-2xl bg-black/30 backdrop-blur-xl flex items-center justify-center border border-white/10">
                  <div className="relative">
                    <div className="absolute inset-0 blur-2xl opacity-50 animate-pulse">
                      <svg
                        className="w-24 h-24 text-cyan-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-24 h-24 text-cyan-300 relative z-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Speed/Progress Text with Glassmorphism */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl py-4 px-8 shadow-lg border border-white/20">
            <div className="relative">
              <div className="absolute inset-0 blur-sm opacity-50">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {testing ? currentSpeed.toFixed(1) : progress}
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent relative z-10">
                {testing ? (
                  <>
                    {currentSpeed.toFixed(1)}
                    <span className="text-sm text-white/60 ml-1">Mbps</span>
                  </>
                ) : (
                  <>
                    {progress}
                    <span className="text-sm text-white/60 ml-1">%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
