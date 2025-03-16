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
  startTest: () => void;
  setError: (error: string | null) => void;
}

export default function TestResults({
  results,
  startTest,
  setError,
}: TestResultsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Test Results</h2>

      {/* Network Metrics */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Download Speed Card */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Download Speed</span>
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-green-500">
            {results.download.toFixed(2)}
            <span className="text-sm text-gray-400 ml-1">Mbps</span>
          </div>
        </div>

        {/* Upload Speed Card */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Upload Speed</span>
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-blue-500">
            {results.upload.toFixed(2)}
            <span className="text-sm text-gray-400 ml-1">Mbps</span>
          </div>
        </div>

        {/* Ping Card */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Ping</span>
            <svg
              className="w-5 h-5 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-purple-500">
            {results.ping.toFixed(2)}
            <span className="text-sm text-gray-400 ml-1">ms</span>
          </div>
        </div>

        {/* Jitter Card */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Jitter</span>
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-yellow-500">
            {results.jitter.toFixed(2)}
            <span className="text-sm text-gray-400 ml-1">ms</span>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-gray-400">Location</span>
            </div>
            <p className="text-white font-medium">
              {results.location.city &&
                `${results.location.city}, ${results.location.region}, ${results.location.country}`}
            </p>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <span className="text-gray-400">IP Address</span>
            </div>
            <p className="text-white font-medium">{results.ip || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-gray-400">ISP</span>
            </div>
            <p className="text-white font-medium">{results.isp || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => {
          setError(null);
          startTest();
        }}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
      >
        Run Test Again
      </button>
    </div>
  );
}
