"use client";

import React, { useState } from "react";

const MAX_TIME_UNIT = 500;

const DEFAULT_PROCESS_DATA: Omit<Process, "pid"> = { arrival: "", burst: "" };

const getInitialProcesses = () => [
  { pid: "P1", ...DEFAULT_PROCESS_DATA },
  { pid: "P2", ...DEFAULT_PROCESS_DATA },
  { pid: "P3", ...DEFAULT_PROCESS_DATA },
  { pid: "P4", ...DEFAULT_PROCESS_DATA },
  { pid: "P5", ...DEFAULT_PROCESS_DATA },
];

interface Process {
  pid: string;
  arrival: number | "";
  burst: number | "";
}

interface ProcessResult extends Omit<Process, "arrival" | "burst"> {
  arrival: number;
  burst: number;
  completion: number;
  waiting: number;
  turnaround: number;
  remaining?: number;
}

// --- FCFS Logic ---
function fcfs(processes: { pid: string; arrival: number; burst: number }[]) {
  const procs = processes
    .map((p) => ({ ...p }))
    .sort((a, b) => a.arrival - b.arrival || a.pid.localeCompare(b.pid));

  const done: ProcessResult[] = [];
  let time = 0;
  const timeline: (string | "IDLE")[] = [];

  for (const current of procs) {
    let startTime = time;

    // 1. Check for IDLE time
    if (current.arrival > time) {
      const idleDuration = current.arrival - time;
      for (let i = 0; i < idleDuration; i++) {
        timeline.push("IDLE");
      }
      startTime = current.arrival;
    }

    // 2. Process Execution
    const completionTime = startTime + current.burst;
    for (let i = 0; i < current.burst; i++) {
      timeline.push(current.pid);
    }

    // 3. Update time and record results
    time = completionTime;

    done.push({
      ...current,
      completion: completionTime,
      turnaround: completionTime - current.arrival,
      waiting: completionTime - current.arrival - current.burst,
    });
  }

  // Compress the timeline: remove consecutive duplicates
  const compressedTimeline = timeline.reduce(
    (acc: (string | "IDLE")[], current) => {
      if (acc.length === 0 || acc[acc.length - 1] !== current) {
        acc.push(current);
      }
      return acc;
    },
    []
  );

  return { timeline: compressedTimeline, results: done };
}

export default function FCFSSimulator() {
  const [processes, setProcesses] = useState<Process[]>(getInitialProcesses());
  const [results, setResults] = useState<ProcessResult[] | null>(null);
  const [timeline, setTimeline] = useState<(string | "IDLE")[] | null>(null);
  const [error, setError] = useState("");

  const updateField = (i: number, field: keyof Process, value: string) => {
    const updated = [...processes];
    setError("");

    if (field === "pid") {
      updated[i].pid = value;
    } else {
      // Ensure only non-negative integers are entered
      if (!/^\d*$/.test(value)) return;
      updated[i][field] = value === "" ? "" : parseInt(value);
    }

    setProcesses(updated);
  };

  const addProcess = () => {
    setProcesses([
      ...processes,
      { pid: `P${processes.length + 1}`, arrival: "", burst: "" },
    ]);
    setResults(null);
    setTimeline(null);
  };

  const removeProcess = (i: number) => {
    const copy = [...processes];
    copy.splice(i, 1);

    const renumbered = copy.map((p, index) => ({ ...p, pid: `P${index + 1}` }));
    setProcesses(renumbered);
    setResults(null);
    setTimeline(null);
    setError("");
  };

  const resetProcesses = () => {
    setProcesses(getInitialProcesses());
    setResults(null);
    setTimeline(null);
    setError("");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    i: number,
    field: "arrival" | "burst"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const nextPidIndex = i + 2;
      const nextId = `${field}-P${nextPidIndex}`;
      const nextElement = document.getElementById(nextId);

      if (nextElement) {
        nextElement.focus();
      } else if (i === processes.length - 1) {
        document.getElementById("add-process-button")?.focus();
      }
    }
  };

  const simulate = () => {
    setError("");
    setResults(null);
    setTimeline(null);

    const validProcesses: { pid: string; arrival: number; burst: number }[] =
      [];

    for (const p of processes) {
      if (!p.pid.trim()) {
        return setError("PID cannot be empty for any process.");
      }

      if (p.arrival === "" && p.burst === "") {
        continue;
      }

      if (p.arrival === "" || p.burst === "") {
        return setError(
          `Process ${p.pid}: Arrival Time and Burst Time must both be filled.`
        );
      }

      const arrival = Number(p.arrival);
      const burst = Number(p.burst);

      if (isNaN(arrival) || isNaN(burst)) {
        return setError(
          `Process ${p.pid}: Arrival Time and Burst Time must be valid numbers.`
        );
      }

      if (arrival < 0 || burst <= 0) {
        return setError(
          `Process ${p.pid}: Arrival Time must be ≥ 0 and Burst Time must be ≥ 1.`
        );
      }
      if (arrival > MAX_TIME_UNIT || burst > MAX_TIME_UNIT) {
        return setError(
          `Process ${p.pid}: Value too large. Times must be ≤ ${MAX_TIME_UNIT}.`
        );
      }

      validProcesses.push({ pid: p.pid, arrival, burst });
    }

    if (validProcesses.length === 0) {
      return setError("Please define at least one process.");
    }

    const out = fcfs(validProcesses);

    setResults(out.results.sort((a, b) => a.pid.localeCompare(b.pid)));
    setTimeline(out.timeline);
  };

  let avgW = 0,
    avgT = 0;

  if (results && results.length > 0) {
    avgW = results.reduce((a, b) => a + b.waiting, 0) / results.length;
    avgT = results.reduce((a, b) => a + b.turnaround, 0) / results.length;
  }

  return (
    <main className="min-h-screen bg-gray-100 font-mono text-gray-900 border-4 border-black p-4 md:p-8">
      <div className="flex items-center border-b-2 border-black pb-3 mb-6">
        <span className="w-4 h-4 bg-black rounded-full mr-2"></span>
        <h1 className="text-3xl font-extrabold text-center md:text-left">
          FCFS Scheduling Simulator
        </h1>
      </div>

      <section className="mb-8 p-4 border-2 border-black bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Input Parameters</h2>

        <div className="mb-4 pb-4 border-b border-gray-300">
          <p className="text-sm font-semibold text-gray-700">
            Algorithm: First Come, First Served (FCFS)
          </p>
          <p className="text-xs text-gray-600">
            Max Time Unit: {MAX_TIME_UNIT}. FCFS is inherently non-preemptive.
          </p>
        </div>

        {error && (
          <div className="border-2 border-red-600 bg-red-100 p-2 mb-4 rounded">
            <p className="text-red-600 font-bold">🚨 {error}</p>
          </div>
        )}

        {/* Process Input Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border-2 border-black rounded-md">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-black">
                <th className="p-3 border border-black w-[25%] min-w-[70px]">
                  P
                </th>
                <th className="p-3 border border-black w-[25%]">
                  Arrival Time (ms)
                </th>
                <th className="p-3 border border-black w-[25%]">
                  Burst Time (ms)
                </th>
                <th className="p-3 border border-black w-[25%]">Action</th>
              </tr>
            </thead>

            <tbody>
              {processes.map((p, i) => (
                <tr key={i} className="bg-white hover:bg-gray-50">
                  <td className="p-2 border border-black text-center min-w-[70px]">
                    <input
                      value={p.pid}
                      readOnly
                      className="w-full text-center border-2 border-gray-400 p-1 font-mono 
                                 focus:border-black bg-gray-100 cursor-not-allowed rounded-md"
                      placeholder={`P${i + 1}`}
                    />
                  </td>

                  <td className="p-2 border border-black text-center">
                    <input
                      type="text"
                      id={`arrival-${p.pid}`}
                      value={p.arrival}
                      onChange={(e) =>
                        updateField(i, "arrival", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, i, "arrival")}
                      className="w-full text-center border-2 border-gray-400 p-1 font-mono focus:border-black rounded-md"
                      placeholder="e.g., 0"
                      maxLength={MAX_TIME_UNIT.toString().length}
                    />
                  </td>

                  <td className="p-2 border border-black text-center">
                    <input
                      type="text"
                      id={`burst-${p.pid}`}
                      value={p.burst}
                      onChange={(e) => updateField(i, "burst", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, i, "burst")}
                      className="w-full text-center border-2 border-gray-400 p-1 font-mono focus:border-black rounded-md"
                      placeholder="e.g., 5"
                      maxLength={MAX_TIME_UNIT.toString().length}
                    />
                  </td>

                  <td className="p-2 border border-black text-center">
                    <button
                      onClick={() => removeProcess(i)}
                      className="retro-button bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded-md shadow-md"
                    >
                      Remove X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <button
            onClick={simulate}
            className="retro-button bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto py-2 px-6 rounded-md shadow-lg transition duration-150"
          >
            SIMULATE FCFS
          </button>

          <div className="flex space-x-4 w-full sm:w-auto justify-end">
            <button
              id="add-process-button"
              onClick={addProcess}
              className="retro-button bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md transition duration-150"
            >
              + Add Process
            </button>
            <button
              onClick={resetProcesses}
              className="retro-button bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md shadow-md transition duration-150"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {results && (
        <section className="mt-8 p-4 border-2 border-black bg-white shadow-md rounded-lg">
          <div className="flex items-center border-b-2 border-black pb-3 mb-4">
            <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
            <h2 className="text-xl font-bold">Simulation Output (FCFS)</h2>
          </div>

          {timeline && (
            <>
              <h3 className="text-lg font-semibold mb-2">
                Gantt Chart (Timeline)
              </h3>
              <div className="p-3 mb-6 bg-gray-900 text-green-400 rounded-lg font-mono overflow-x-auto text-sm whitespace-nowrap border-2 border-black">
                {timeline.join(" → ")}
              </div>
            </>
          )}

          <h3 className="text-lg font-semibold mb-2">Process Metrics</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border-2 border-black rounded-md">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-black">
                  <th className="p-2 border border-black">P</th>
                  <th className="p-2 border border-black">Arrival</th>
                  <th className="p-2 border border-black">Burst</th>
                  <th className="p-2 border border-black">Completion</th>
                  <th className="p-2 border border-black bg-green-200">
                    Turnaround
                  </th>
                  <th className="p-2 border border-black bg-yellow-200">
                    Waiting
                  </th>
                </tr>
              </thead>

              <tbody>
                {results.map((p) => (
                  <tr key={p.pid} className="bg-white hover:bg-gray-50">
                    <td className="p-2 border border-black text-center">
                      {p.pid}
                    </td>
                    <td className="p-2 border border-black text-center">
                      {p.arrival}
                    </td>
                    <td className="p-2 border border-black text-center">
                      {p.burst}
                    </td>
                    <td className="p-2 border border-black text-center">
                      {p.completion}
                    </td>
                    <td className="p-2 border border-black text-center bg-green-50">
                      {Math.round(p.turnaround)}
                    </td>
                    <td className="p-2 border border-black text-center bg-yellow-50">
                      {Math.round(p.waiting)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 border-2 border-black bg-gray-200 rounded-md flex flex-col sm:flex-row justify-around text-lg font-bold space-y-2 sm:space-y-0">
            <p>
              Avg Waiting Time:{" "}
              <span className="text-red-600">{avgW.toFixed(2)}</span>
            </p>
            <p>
              Avg Turnaround Time:{" "}
              <span className="text-blue-600">{avgT.toFixed(2)}</span>
            </p>
          </div>
        </section>
      )}
      {/* Footer */}
      <footer className="border-t-2 border-black pt-4 mt-8 text-center text-sm text-gray-700">
        <p>
          &copy; {new Date().getFullYear()} Chimairel Pacaldo. All rights
          reserved.
        </p>
        <p>Inspired by classic Mac OS aesthetics.</p>
      </footer>
    </main>
  );
}
