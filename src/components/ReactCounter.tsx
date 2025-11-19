import { useState } from 'react';

interface CounterProps {
  initialCount?: number;
}

export default function ReactCounter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState(initialCount);
  const decrementDisabled = count === 0;
  const canReset = count !== initialCount;

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/70 p-6 text-slate-900 shadow-lg backdrop-blur">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Tailwind Demo
        </p>
        <h3 className="text-2xl font-semibold">Reactive Counter</h3>
        <p className="mt-2 text-sm text-slate-600">
          This React island uses plain Tailwind utilities—no component library required.
        </p>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-6xl font-black tracking-tight">{count}</span>
        <span className="rounded-full border border-slate-200/70 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          clicks
        </span>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className="flex-1 min-w-[140px] rounded-full bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        <button
          type="button"
          className="flex-1 min-w-[140px] rounded-full border border-indigo-600/40 px-4 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-40"
          onClick={() => setCount((prev) => Math.max(0, prev - 1))}
          disabled={decrementDisabled}
        >
          Decrement
        </button>
        <button
          type="button"
          className="grow rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-700 disabled:opacity-40"
          onClick={() => setCount(initialCount)}
          disabled={!canReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
