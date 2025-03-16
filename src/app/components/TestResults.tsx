type TestResultsProps = {
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
};

export default function TestResults({
  results,
  startTest,
  setError,
}: TestResultsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-5 mt-5 shadow-lg">
      <h2 className="text-xl font-bold mb-3">Test Results</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">Download Speed</p>
          <p className="text-xl font-bold">
            {results.download.toFixed(2)} Mbps
          </p>
        </div>
        <div>
          <p className="text-gray-400">Upload Speed</p>
          <p className="text-xl font-bold">{results.upload.toFixed(2)} Mbps</p>
        </div>
        <div>
          <p className="text-gray-400">Ping</p>
          <p className="text-xl font-bold">{results.ping.toFixed(2)} ms</p>
        </div>
        <div>
          <p className="text-gray-400">IP Address</p>
          <p className="text-xl font-bold">{results.ip || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">Location</p>
          <p className="text-xl font-bold">
            {results.location.city &&
              `${results.location.city}, ${results.location.region}, ${results.location.country}`}
          </p>
        </div>
      </div>
      <button
        onClick={() => {
          setError(null);
          startTest();
        }}
        className="text-blue-500 hover:text-blue-400 mt-2"
      >
        Retry Test
      </button>
    </div>
  );
}
