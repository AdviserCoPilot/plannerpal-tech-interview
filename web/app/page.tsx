"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Parent, Class, MyRegistrations, ActionMessage } from "./types";
import { API_URL } from "./utils";
import {
  Header,
  Toast,
  ClassManagementHeader,
  MyBookings,
  ClassTable,
  AdminView,
} from "./components";

export default function Home() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [myRegs, setMyRegs] = useState<MyRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<ActionMessage | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [view, setView] = useState<"classes" | "admin">("classes");

  const selectedParentRef = useRef(selectedParent);
  selectedParentRef.current = selectedParent;

  useEffect(() => {
    if (!actionMsg) return;
    const t = setTimeout(() => setActionMsg(null), 4000);
    return () => clearTimeout(t);
  }, [actionMsg]);

  const refreshAll = useCallback(async (parentId?: string) => {
    const pid = parentId || selectedParentRef.current;
    const fetches: Promise<unknown>[] = [
      fetch(`${API_URL}/classes`)
        .then((r) => r.json())
        .then(setClasses),
    ];
    if (pid) {
      fetches.push(
        fetch(`${API_URL}/registrations?parentId=${pid}`)
          .then((r) => r.json())
          .then(setMyRegs)
      );
    }
    await Promise.all(fetches);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/classes`).then((r) => r.json()),
      fetch(`${API_URL}/parents`).then((r) => r.json()),
    ])
      .then(async ([cls, par]) => {
        setClasses(cls);
        setParents(par);
        if (par.length) {
          const firstId = par[0].id;
          setSelectedParent(firstId);
          const regs = await fetch(
            `${API_URL}/registrations?parentId=${firstId}`
          ).then((r) => r.json());
          setMyRegs(regs);
        }
      })
      .catch(() => setError("Could not load data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedParent) return;
    fetch(`${API_URL}/registrations?parentId=${selectedParent}`)
      .then((r) => r.json())
      .then(setMyRegs)
      .catch(() => setMyRegs(null));
  }, [selectedParent]);

  useEffect(() => {
    const interval = setInterval(() => refreshAll(), 3000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const register = async (classId: string) => {
    if (!selectedParent) {
      setActionMsg({ type: "err", text: "Select a parent first" });
      return;
    }
    setBusy(classId);
    setActionMsg(null);
    try {
      const res = await fetch(`${API_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, parentId: selectedParent }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      setActionMsg({ type: "ok", text: "Registered!" });
      await refreshAll();
    } catch (e) {
      setActionMsg({
        type: "err",
        text: e instanceof Error ? e.message : "Failed",
      });
    } finally {
      setBusy(null);
    }
  };

  const cancel = async (regId: string) => {
    setBusy(regId);
    setActionMsg(null);
    try {
      const res = await fetch(`${API_URL}/registrations/${regId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel");
      }
      setActionMsg({ type: "ok", text: "Registration cancelled" });
      await refreshAll();
    } catch (e) {
      setActionMsg({
        type: "err",
        text: e instanceof Error ? e.message : "Could not cancel",
      });
    } finally {
      setBusy(null);
    }
  };

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading…</div>
      </main>
    );
  if (error)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );

  return (
    <main className="min-h-screen">
      <Header
        parents={parents}
        selectedParent={selectedParent}
        onParentChange={setSelectedParent}
        view={view}
        onViewChange={setView}
      />

      {actionMsg && <Toast message={actionMsg} />}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {view === "admin" ? (
          <AdminView classes={classes} />
        ) : (
          <>
            <ClassManagementHeader onRefresh={() => refreshAll()} />

            {myRegs && (
              <MyBookings myRegs={myRegs} busy={busy} onCancel={cancel} />
            )}

            <ClassTable
              classes={classes}
              myRegs={myRegs}
              busy={busy}
              onRegister={register}
            />
          </>
        )}
      </div>
    </main>
  );
}
