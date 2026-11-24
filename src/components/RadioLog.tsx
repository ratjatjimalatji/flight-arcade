import { useState } from 'react';
import type { ApiLogEntry } from '../types';

/** Shows every HTTP call the frontend made — handy for seeing the full-stack round trip. */
export function RadioLog({ entries }: { entries: ApiLogEntry[] }) {
  const [open, setOpen] = useState(false);
  const last = entries[0];
  return (
    <footer className="radio">
      <button className="radio-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        RADIO LOG {open ? '▾' : '▸'}
        {last && (
          <span className="radio-last">
            {last.method} {last.path} <Status s={last.status} /> {last.ms}ms
          </span>
        )}
        {!last && <span className="radio-last muted">no requests yet</span>}
      </button>
      {open && (
        <ol className="radio-list">
          {entries.map((e) => (
            <li key={e.id}>
              <span className="muted">{e.at.toLocaleTimeString()}</span>
              <span>{e.method}</span>
              <span className="radio-path">{e.path}</span>
              <Status s={e.status} />
              <span className="muted">{e.ms}ms</span>
            </li>
          ))}
        </ol>
      )}
    </footer>
  );
}

function Status({ s }: { s: number | 'ERR' }) {
  const ok = typeof s === 'number' && s < 400;
  return <span className={ok ? 'ok' : 'bad'}>{s}</span>;
}
