// Approved tester allowlist for Danny's Eufaula Bites.
//
// This is a lightweight client-side access gate for the private beta — it keeps
// the app from being casually opened by people outside the tester group. It is
// NOT a security boundary (the code ships to the browser); it's an access
// courtesy for a static site with no backend. Add a tester by dropping their
// email in the list below. Comparison is case-insensitive and trims whitespace.

export const TESTERS = [
  'dannyo31512@gmail.com',
];

const normalize = (email) => (email || '').trim().toLowerCase();

export function isApprovedTester(email) {
  const e = normalize(email);
  return e.length > 0 && TESTERS.some((t) => normalize(t) === e);
}
