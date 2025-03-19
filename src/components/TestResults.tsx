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
  setError: (error: string | null) => void;
}

export default function TestResults({ results, testing, setError }: TestResultsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center text-white mb-8">Test Results</h2>

      {/* Speed Test Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 p-5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Download</span>
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {results.download.toFixed(2)}
            <span className="text-base ml-1">Mbps</span>
          </div>
        </div>

        <div className="bg-gray-900/50 p-5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Upload</span>
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {results.upload.toFixed(2)}
            <span className="text-base ml-1">Mbps</span>
          </div>
        </div>

        {/* Ping and ISP in one row with 30-70 split */}
        <div className="col-span-2 grid grid-cols-10 gap-4">
          <div className="col-span-4 bg-gray-900/50 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Ping</span>
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {results.ping.toFixed(0)}
              <span className="text-base ml-1">ms</span>
            </div>
          </div>

          <div className="col-span-6 bg-gray-900/50 p-5 rounded-xl">
            <div className="text-gray-400 text-xs mb-2">Internet Service Provider</div>
            <div className="text-base font-semibold text-white">{results.isp || 'Loading...'}</div>
          </div>
        </div>
      </div>

      {/* Customer Info Section */}
      <div className="grid grid-cols-10 gap-4">
        {/* Customer IP */}
        <div className="col-span-5 bg-gray-900/50 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-xs mb-2">Customer IP</div>
              <div className="text-base font-semibold text-white">{results.ip || 'Loading...'}</div>
            </div>
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
        </div>

        {/* Location */}
        <div className="col-span-5 bg-gray-900/50 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-xs mb-2">Location</div>
              <div className="text-base font-semibold text-white">
                {results.location.city && results.location.country
                  ? `${results.location.city}, ${results.location.country}`
                  : 'Loading...'}
              </div>
            </div>
            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
