"use client";

import React, { useState, useEffect } from "react";
import { CircuitStudioCanvas } from "@/components/circuits/CircuitStudioCanvas";
import { Cpu } from "lucide-react";

export default function CircuitStudioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedCircuit, setSelectedCircuit] = useState<any>(null);
  const [projectName, setProjectName] = useState("Circuit Studio Sandbox");

  useEffect(() => {
    let active = true;

    async function initStudio() {
      // Check if there is a pending circuit stashed from Project Builder
      try {
        const stashed = typeof window !== "undefined" ? sessionStorage.getItem("circuitdoctor_temp_circuit") : null;
        if (stashed) {
          const parsed = JSON.parse(stashed);
          if (parsed?.circuit && active) {
            setSelectedCircuit(parsed.circuit);
            setProjectName(parsed.title || "Project Builder Generated Circuit");
            sessionStorage.removeItem("circuitdoctor_temp_circuit");
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to read sessionStorage circuit:", e);
      }

      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (active && data.ok && data.projects?.length > 0) {
          setProjects(data.projects);
          const first = data.projects[0];
          setSelectedProjectId(first.id);
          setProjectName(first.title);
          setSelectedCircuit(first.circuit);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }

    initStudio();

    return () => {
      active = false;
    };
  }, []);

  const handleSelectProject = async (id: string) => {
    setSelectedProjectId(id);
    const p = projects.find((proj) => proj.id === id);
    if (p) {
      setProjectName(p.title);
      setSelectedCircuit(p.circuit);
    }
  };

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
      {/* Top Project Switcher Subbar */}
      <div className="flex h-11 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Cpu className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
            <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Active Workspace:
            </span>
          </div>
          <select
            value={selectedProjectId}
            onChange={(e) => handleSelectProject(e.target.value)}
            className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.board})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 dark:border-zinc-800 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            Visual Node & Wire Schematics
          </span>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden">
        <CircuitStudioCanvas
          key={selectedProjectId}
          initialCircuit={selectedCircuit}
          projectId={selectedProjectId}
          projectName={projectName}
        />
      </div>
    </div>
  );
}
