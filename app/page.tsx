"use client";

import { useEffect, useState } from "react";

type Poll = {
  id: string;
  question: string;
  votes_yes: number;
  votes_no: number;
  userVoted?: boolean;
};

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [status, setStatus] = useState("");

  async function fetchPolls() {
    const res = await fetch("/api/polls");
    const data = await res.json();
    setPolls(data);
  }

  useEffect(() => {
    fetchPolls();
  }, []);

  async function vote(pollId: string, choice: "yes" | "no") {
    setStatus("");
    const res = await fetch(`/api/polls/${pollId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    });

    if (res.status === 409) {
      setStatus("⚠️ Ya votaste en esta encuesta");
    } else if (res.ok) {
      setStatus("✅ Voto registrado");
      fetchPolls();
    } else {
      setStatus("❌ Error al registrar voto");
    }
  }

  return (
    <main className="flex flex-col items-center p-6 gap-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">Chile vota</h1>
      {status && <p className="text-sm text-gray-800">{status}</p>}

      <div className="w-full flex flex-col gap-4">
        {polls.length === 0 && <p className="text-gray-800">No polls yet.</p>}

        {polls.map((p) => {
          console.log("Poll data: ", p);
          const total = Number(p.votes_yes) + Number(p.votes_no);
          const yesPct = total ? ((p.votes_yes / total) * 100).toFixed(1) : "0";
          const noPct = total ? ((p.votes_no / total) * 100).toFixed(1) : "0";

          //console.log("total: ", total, " yesPct: ", yesPct, " noPct: ", noPct, p.votes_no, p.votes_yes);

          return (
            <div
              key={p.id}
              className="border rounded-lg p-4 flex flex-col gap-3 bg-white shadow"
            >
              <h3 className="font-medium text-lg text-gray-900">{p.question}</h3>

              {/* Results bar */}
              <div className="flex w-full h-4 bg-gray-300 rounded overflow-hidden">
                <div
                  style={{ flexGrow: p.votes_yes }}
                  className="bg-green-600"
                ></div>
                <div
                  style={{ flexGrow: p.votes_no }}
                  className="bg-red-600"
                ></div>
              </div>

              {/* Optional: show percentages on top */}
              <div className="flex justify-between text-xs text-gray-800 mt-1">
                <span>👍 {yesPct}%</span>
                <span>👎 {noPct}%</span>
              </div>

              {/* <div className="text-sm text-gray-700">
                👍 Yes: {p.votes_yes} ({yesPct}%) | 👎 No: {p.votes_no} ({noPct}%)
              </div> */}

              {!p.userVoted ? (
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => vote(p.id, "yes")}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Vote Yes
                  </button>
                  <button
                    onClick={() => vote(p.id, "no")}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Vote No
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-800 mt-1 italic">
                  Ya votaste en esta encuesta.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
