import { useEffect, useState } from 'react';

interface Props {
  apiBase: string;
  status: 'live' | 'sample' | 'loading' | 'error';
  loadedAt: Date | null;
  onSubmit: (base: string) => void;
  onRefresh: () => void;
}

const LABEL: Record<Props['status'], string> = {
  live: 'LIVE',
  sample: 'SAMPLE DATA — not from server',
  loading: 'CONNECTING',
  error: 'OFFLINE',
};

export function ConnectionBar({ apiBase, status, loadedAt, onSubmit, onRefresh }: Props) {
  const [draft, setDraft] = useState(apiBase);
  useEffect(() => setDraft(apiBase), [apiBase]);

  return (
    <form
      className="connection"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      <label htmlFor="api-base">API base URL</label>
      <input
        id="api-base"
        type="url"
        required
        spellCheck={false}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="http://YOUR-EC2-PUBLIC-DNS:8080/flightservices"
      />
      <button className="btn" type="submit">Connect</button>
      <button className="btn ghost" type="button" onClick={onRefresh} disabled={status === 'loading'}>
        Refresh
      </button>
      <span className={`status status-${status}`} aria-live="polite">
        <span className="dot" aria-hidden="true" />
        {LABEL[status]}
        {loadedAt && status === 'live' && (
          <span className="muted"> · {loadedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        )}
      </span>
    </form>
  );
}
