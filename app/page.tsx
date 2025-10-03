"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { Spinner } from "@/components/ui/spinner"
import { Github } from "lucide-react";

type Poll = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  votes_a: number;
  votes_b: number;
  userVoted?: boolean;
};

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);

  async function fetchPolls() {
    const res = await fetch("/api/polls");
    const data = await res.json();
    setPolls(data);
  }

  useEffect(() => {
    fetchPolls();
  }, []);

  async function vote(pollId: string, choice: string) {
    const res = await fetch(`/api/polls/${pollId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    });

    if (res.status === 409) {
      toast.error("Ya votaste en esta encuesta");
    } else if (res.ok) {
      toast.success("Voto registrado");
      fetchPolls();
    } else {
      toast.error("Error al registrar voto");
    }
  }

  return (
    <main>
      <header className="bg-gray-900 text-white py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-semibold text-center w-full">Chile vota</h1>
        <a
          href="https://github.com/yourusername/yourrepo" // ← change this
          target="_blank"
          className="absolute right-6 flex items-center gap-2 text-sm text-gray-200 hover:text-white"
        >
          <Github className="w-5 h-5" />
          <span className="hidden sm:inline">Repo</span>
        </a>
      </header>

      <div className="flex flex-col items-center p-6 gap-8 max-w-xl mx-auto">
        <div className="w-full flex flex-col gap-4">
          {!polls || polls.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="size-8" />
            </div>
          ) : (
            polls.map((p) => {
            const total = Number(p.votes_a) + Number(p.votes_b);
            const pctA = total ? ((p.votes_a / total) * 100).toFixed(1) : "0";
            const pctB = total ? ((p.votes_b / total) * 100).toFixed(1) : "0";

            return (
              <div
                key={p.id}
                className="border rounded-lg p-4 flex flex-col gap-3 bg-white shadow"
              >
                <h3 className="font-medium text-lg text-gray-900">{p.question}</h3>

                {/* Results bar */}
                <div className="flex w-full h-4 bg-gray-300 rounded overflow-hidden">
                  <div style={{ flexGrow: p.votes_a }} className="bg-green-600"></div>
                  <div style={{ flexGrow: p.votes_b }} className="bg-red-600"></div>
                </div>

                <div className="flex justify-between text-xs text-gray-800 mt-1">
                  <span>{pctA}%</span>
                  <span>{pctB}%</span>
                </div>

                {!p.userVoted ? (
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => vote(p.id, p.option_a)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      {p.option_a}
                    </button>
                    <button
                      onClick={() => vote(p.id, p.option_b)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      {p.option_b}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 mt-1 italic">
                    Ya votaste en esta encuesta.
                  </p>
                )}
              </div>
            );
            })
          )}
        </div>
      </div>
      <Toaster position="bottom-center" richColors />
    </main>
  );
}
