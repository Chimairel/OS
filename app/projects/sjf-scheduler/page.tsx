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

// --- SJF Non-Preemptive (NP) Logic ---
function sjfNonPreemptive(
  processes: { pid: string; arrival: number; burst: number }[]
) {
  const n = processes.length;
  const procs = processes.map((p) => ({ ...p }));
  const done: ProcessResult[] = [];

  let time = 0;
  let completed = 0;

  while (completed < n) {
    // 1. Find all available processes (arrived and not completed)
    const available = procs.filter((p) => p.arrival <= time && p.burst >= 0);

    if (available.length === 0) {
      // If no processes are available, check if any are unarrived
      const unarrived = procs
        .filter((p) => p.burst > 0 && p.arrival > time)
        .sort((a, b) => a.arrival - b.arrival);
      if (unarrived.length > 0) {
        // Move time forward to the next arrival time (IDLE time)
        time = unarrived[0].arrival;
      } else {
        // No more processes left, exit
        break;
      }
      continue;
    }

    // 2. Sort by Shortest Burst Time (SBT), then by Arrival Time (tie-breaker)
    available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
    const current = available[0];

    // 3. Execute the process
    const startTime = Math.max(time, current.arrival);
    time = startTime + current.burst;

    // 4. Record results
    done.push({
      ...current,
      completion: time,
      turnaround: time - current.arrival,
      waiting: time - current.arrival - current.burst,
    });

    // Mark as completed by setting burst to -1
    const procIndex = procs.findIndex(
      (p) =>
        p.pid === current.pid &&
        p.arrival === current.arrival &&
        p.burst === current.burst
    );
    if (procIndex !== -1) {
      procs[procIndex].burst = -1;
    }

    completed++;
  }

  // Generate Timeline (Gantt Chart)
  const timeline: (string | "IDLE")[] = [];
  let currentTime = 0;
  done.forEach((p) => {
    const start = p.completion - p.burst;
    if (start > currentTime) {
      // Add IDLE time
      for (let i = 0; i < start - currentTime; i++) {
        timeline.push("IDLE");
      }
    }
    // Add execution time
    for (let i = 0; i < p.burst; i++) {
      timeline.push(p.pid);
    }
    currentTime = p.completion;
  });

  return { timeline, results: done };
}

// --- SJF Preemptive (Shortest Remaining Time First or SRTF) Logic ---
function sjfPreemptive(
  processes: { pid: string; arrival: number; burst: number }[]
) {
  const proc: ProcessResult[] = processes.map((p) => ({
    ...p,
    remaining: p.burst,
    completion: 0,
    waiting: 0,
    turnaround: 0,
  }));

  let time = 0;
  let completed = 0;
  const n = proc.length;
  const timeline: (string | "IDLE")[] = [];

  while (completed < n) {
    let idx = -1;
    let min = Infinity;

    // 1. Find the process with the shortest remaining time that has arrived
    for (let i = 0; i < n; i++) {
      if (
        proc[i].arrival <= time &&
        proc[i].remaining! > 0 &&
        proc[i].remaining! < min
      ) {
        min = proc[i].remaining!;
        idx = i;
      }
    }

    if (idx === -1) {
      // If no process is available, CPU is IDLE
      timeline.push("IDLE");
      time++;
      continue;
    }

    // 2. Execute the selected process for 1 unit of time
    proc[idx].remaining!--;
    timeline.push(proc[idx].pid);
    time++;

    // 3. Check if the process completed
    if (proc[idx].remaining === 0) {
      completed++;
      proc[idx].completion = time;
      proc[idx].turnaround = time - proc[idx].arrival;
      proc[idx].waiting = proc[idx].turnaround - proc[idx].burst;
    }
  }

  return { timeline, results: proc };
}

export default function SJFSimulator() {
  const [mode, setMode] = useState<"preemptive" | "nonPreemptive">(
    "preemptive"
  );

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

  // --- NEW: Handle Enter Key Navigation ---
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    i: number,
    field: "arrival" | "burst"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Calculate the PID index of the next row. Since PIDs start at P1 and i is 0-indexed,
      // the next PID is P(i+2).
      const nextPidIndex = i + 2;
      const nextId = `${field}-P${nextPidIndex}`;

      const nextElement = document.getElementById(nextId);

      if (nextElement) {
        // Focus the next input field in the same column
        nextElement.focus();
      } else if (i === processes.length - 1) {
        // If it's the last row, focus the "Add Process" button
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

    validProcesses.sort((a, b) => a.arrival - b.arrival);

    let out;
    if (mode === "nonPreemptive") {
      out = sjfNonPreemptive(validProcesses);
    } else {
      out = sjfPreemptive(validProcesses);
    }

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
        <h1 className="text-3xl font-extrabold">SJF Scheduling Simulator</h1>
      </div>

      <section className="mb-8 p-4 border-2 border-black bg-white shadow-md">
        <h2 className="text-xl font-bold mb-4">Input Parameters</h2>

        <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-300">
          <label className="font-semibold">SJF Type:</label>
          <select
            value={mode}
            onChange={(e) =>
              setMode(e.target.value as "preemptive" | "nonPreemptive")
            }
            className="p-2 border-2 border-black bg-gray-50 font-mono focus:outline-none"
          >
            <option value="preemptive">Preemptive (SRTF)</option>
            <option value="nonPreemptive">Non-Preemptive</option>
          </select>
          <p className="text-xs text-gray-600">
            Max Time Unit: {MAX_TIME_UNIT}
          </p>
        </div>

        {error && (
          <div className="border-2 border-red-600 bg-red-100 p-2 mb-4">
            <p className="text-red-600 font-bold">🚨 {error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-black">
                <th className="p-3 border border-black">P</th>
                <th className="p-3 border border-black">Arrival Time (ms)</th>
                <th className="p-3 border border-black">Burst Time (ms)</th>
                <th className="p-3 border border-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p, i) => (
                <tr key={i} className="bg-white hover:bg-gray-50">
                  <td className="p-2 border border-black text-center">
                    <input
                      value={p.pid}
                      readOnly
                      className="w-full text-center border-2 border-gray-400 p-1 font-mono focus:border-black bg-gray-100 cursor-not-allowed"
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
                      className="w-full text-center border-2 border-gray-400 p-1 font-mono focus:border-black"
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
                      className="w-full text-center border-2 border-gray-400 p-1 font-mono focus:border-black"
                      placeholder="e.g., 5"
                      maxLength={MAX_TIME_UNIT.toString().length}
                    />
                  </td>
                  <td className="p-2 border border-black text-center">
                    <button
                      onClick={() => removeProcess(i)}
                      className="retro-button bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3"
                    >
                      Remove X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={simulate}
            className="retro-button bg-green-600 hover:bg-green-700 text-white"
          >
            SIMULATE
          </button>

          <div className="flex space-x-4">
            <button
              id="add-process-button"
              onClick={addProcess}
              className="retro-button bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Add Process
            </button>
            <button
              onClick={resetProcesses}
              className="retro-button bg-gray-500 hover:bg-gray-600 text-white"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {results && (
        <section className="mt-8 p-4 border-2 border-black bg-white shadow-md">
          <div className="flex items-center border-b-2 border-black pb-3 mb-4">
            <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
            <h2 className="text-xl font-bold">
              Simulation Output ({mode === "preemptive" ? "SRTF" : "SJF-NP"})
            </h2>
          </div>

          {timeline && (
            <>
              <h3 className="text-lg font-semibold mb-2">
                Gantt Chart (Timeline)
              </h3>
              <div className="p-3 mb-6 bg-gray-900 text-green-400 rounded font-mono overflow-x-auto text-sm whitespace-nowrap border-2 border-black">
                {timeline.join(" → ")}
              </div>
            </>
          )}

          <h3 className="text-lg font-semibold mb-2">Process Metrics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border-2 border-black">
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
                      {p.turnaround.toFixed(0)}
                    </td>
                    <td className="p-2 border border-black text-center bg-yellow-50">
                      {p.waiting.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 border-2 border-black bg-gray-200 flex justify-around text-lg font-bold">
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
    </main>
  );
}
