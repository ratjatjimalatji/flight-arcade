import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, loadAirport, loadApiBase, normaliseBase, saveApiBase } from './api';
import { SAMPLE_DATA } from './sampleData';
import type { AirportData, ApiLogEntry } from './types';
import { Apron } from './views/Apron';
import { Terminal } from './views/Terminal';
import { ConnectionBar } from './components/ConnectionBar';
import { RadioLog } from './components/RadioLog';

type View = 'apron' | 'terminal';
export type Source = 'live' | 'sample';

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: AirportData; source: Source; loadedAt: Date };

export default function App() {
  const [apiBase, setApiBase] = useState(loadApiBase);
  const [view, setView] = useState<View>('apron');
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [log, setLog] = useState<ApiLogEntry[]>([]);
  const nextLogId = useRef(1);

  const addLog = useCallback((e: Omit<ApiLogEntry, 'id' | 'at'>) => {
    setLog((prev) => [{ ...e, id: nextLogId.current++, at: new Date() }, ...prev].slice(0, 30));
  }, []);

  const refresh = useCallback(
    async (base: string) => {
      setState({ kind: 'loading' });
      try {
        const data = await loadAirport(base, addLog);
        setState({ kind: 'ready', data, source: 'live', loadedAt: new Date() });
      } catch (err) {
        const message = err instanceof ApiError || err instanceof Error ? err.message : String(err);
        setState({ kind: 'error', message });
      }
    },
    [addLog],
  );

  useEffect(() => {
    refresh(apiBase);
  }, [apiBase, refresh]);

  const changeBase = (raw: string) => {
    const base = normaliseBase(raw);
    saveApiBase(base);
    if (base === apiBase) refresh(base);
    else setApiBase(base);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">✈</span>
          <div>
            <h1>FLIGHTSERVICES</h1>
            <p className="brand-sub">Ground control for your Spring Boot API</p>
          </div>
        </div>
        <nav className="signs" aria-label="Airport areas">
          <button
            className="sign"
            aria-pressed={view === 'apron'}
            onClick={() => setView('apron')}
          >
            <span className="sign-label"><span className="sign-arrow" aria-hidden="true">←</span> APRON</span>
            <small>GET /flights</small>
          </button>
          <button
            className="sign"
            aria-pressed={view === 'terminal'}
            onClick={() => setView('terminal')}
          >
            <span className="sign-label">TERMINAL <span className="sign-arrow" aria-hidden="true">→</span></span>
            <small>GET /passengers</small>
          </button>
        </nav>
      </header>

      <ConnectionBar
        apiBase={apiBase}
        status={state.kind === 'ready' ? state.source : state.kind}
        loadedAt={state.kind === 'ready' ? state.loadedAt : null}
        onSubmit={changeBase}
        onRefresh={() => refresh(apiBase)}
      />

      <main className="stage">
        {state.kind === 'loading' && (
          <div className="screen-message" role="status">
            <p className="blink">CONTACTING TOWER…</p>
            <p className="muted">GET {apiBase}/flights, /reservations, /passengers</p>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="screen-message error" role="alert">
            <p className="screen-title">NO RADIO CONTACT</p>
            <p>{state.message}</p>
            <ul className="checklist">
              <li>Start the app on EC2: <code>java -jar flightservices.jar</code></li>
              <li>Use the instance's current Public IPv4 DNS (it changes after stop/start)</li>
              <li>Keep <code>/flightservices</code> on the end — it's the context path</li>
            </ul>
            <div className="row">
              <button className="btn primary" onClick={() => refresh(apiBase)}>Try again</button>
              <button
                className="btn"
                onClick={() => setState({ kind: 'ready', data: SAMPLE_DATA, source: 'sample', loadedAt: new Date() })}
              >
                Use sample data
              </button>
            </div>
          </div>
        )}

        {state.kind === 'ready' &&
          (view === 'apron' ? (
            <Apron data={state.data} />
          ) : (
            <Terminal data={state.data} />
          ))}
      </main>

      <RadioLog entries={log} />
    </div>
  );
}
