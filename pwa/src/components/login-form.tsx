"use client";

import { useState, FormEvent } from "react";
import pb from "@/lib/pb";

export default function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await pb.collection("users").authWithPassword(email, password);
      onLogin();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
      >
        <h1 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          FloatyNotey
        </h1>
        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <label className="mb-1 block text-sm text-neutral-700 dark:text-neutral-300">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
          autoFocus
        />
        <label className="mb-1 block text-sm text-neutral-700 dark:text-neutral-300">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
