const ZONES = [
  { id: 'upper', label: 'Upper River',  hint: 'Riverine upper end above Cowikee Creek — current seams, stump flats, and backwater sloughs.' },
  { id: 'mid',   label: 'Mid Lake',     hint: 'Eufaula city area and the big creek arms (Cowikee, Barbour, White Oak) — ledges, grass lines, and creek mouths.' },
  { id: 'deep',  label: 'Lower Dam',    hint: 'Fort Gaines / Walter F. George Dam area — the deepest, clearest water with rocky banks and bluffs.' },
];

export default function ZoneSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ZONES.map(z => {
        const selected = value === z.id;
        return (
          <button
            key={z.id}
            onClick={() => onChange(z.id)}
            title={z.hint}
            aria-pressed={selected}
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium border transition',
              selected
                ? 'bg-accent text-bg border-accent shadow-[0_0_18px_rgba(14,210,210,0.35)]'
                : 'bg-surface text-body border-edge hover:border-accent/60',
            ].join(' ')}
          >
            {z.label}
          </button>
        );
      })}
    </div>
  );
}
