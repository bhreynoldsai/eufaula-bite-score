import { useState } from 'react';
import { isApprovedTester } from '../testers.js';
import GuideAvatar from './GuideAvatar.jsx';

const STORAGE_KEY = 'eufaula-tester-email';

function loadStoredTester() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && isApprovedTester(saved) ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Wraps the app in a private-beta access gate. Approved testers (see
 * src/testers.js) enter their email once; it's remembered in localStorage so
 * they aren't prompted again on this device.
 */
export default function TesterGate({ children }) {
  const [email, setEmail] = useState(loadStoredTester);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  if (email) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (isApprovedTester(input)) {
      const normalized = input.trim();
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        /* private-mode / storage disabled — proceed for this session anyway */
      }
      setError('');
      setEmail(normalized);
    } else {
      setError("That email isn't on the tester list yet. Check with Danny to get access.");
    }
  }

  return (
    <div className="min-h-screen text-body flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-edge rounded-2xl bg-bg/80 backdrop-blur p-6 sm:p-8 flex flex-col items-center text-center">
        <GuideAvatar size={80} hideIfMissing />
        <h1 className="font-display text-2xl font-bold text-heading uppercase tracking-wider mt-4">
          Danny's <span className="text-accent">Eufaula Bites</span>
        </h1>
        <p className="text-sm text-body/70 mt-2">
          Private beta — enter your tester email to continue.
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col gap-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={input}
            onChange={(e) => { setInput(e.target.value); if (error) setError(''); }}
            placeholder="you@example.com"
            aria-label="Tester email"
            className="w-full rounded-lg bg-black/20 border border-edge px-3 py-2 text-body placeholder:text-body/40 focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-accent text-black font-semibold px-3 py-2 uppercase tracking-wide hover:brightness-110 transition"
          >
            Enter
          </button>
        </form>

        {error && (
          <p className="text-xs text-amber-300 mt-3" role="alert">{error}</p>
        )}
      </div>
    </div>
  );
}
