interface TestResultsProps {
  results: {
    download: number;
    upload: number;
    ping: number;
    ip: string;
    location: {
      city: string;
      country: string;
      region: string;
    };
    jitter: number;
    latency: number;
    isp: string;
  };
  testing: boolean;
  startTest?: () => void;
  setError: (error: string | null) => void;
}

export default function TestResults({
  results,
  testing,
  startTest,
  setError,
}: TestResultsProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Test Results</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Download Speed Card */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Download</span>
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {results.download.toFixed(2)} <span className="text-lg">Mbps</span>
          </div>
        </div>

        {/* Upload Speed Card */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Upload</span>
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {results.upload.toFixed(2)} <span className="text-lg">Mbps</span>
          </div>
        </div>

        {/* Ping Card */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Ping</span>
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {results.ping.toFixed(0)} <span className="text-lg">ms</span>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Location</span>
            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-lg text-gray-300">
            {results.location?.city}, {results.location?.country}
          </div>
        </div>
      </div>
    </div>
  );
}
