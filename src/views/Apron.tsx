import { useMemo, useState } from 'react';
import type { AirportData, Flight, Reservation } from '../types';
import { PlaneSprite } from '../sprites';
import { formatTime, liveryFor } from '../look';
import { Modal } from '../components/Modal';
import { Manifest } from './Manifest';

export function Apron({ data }: { data: AirportData }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // GET /reservations gives the passenger ↔ flight link; group it by flight id.
  const byFlight = useMemo(() => {
    const map = new Map<number, Reservation[]>();
    for (const r of data.reservations) {
      const id = r.flight?.id;
      if (id == null) continue;
      map.set(id, [...(map.get(id) ?? []), r]);
    }
    return map;
  }, [data.reservations]);

  const flights = useMemo(() => [...data.flights].sort((a, b) => a.id - b.id), [data.flights]);
  const selected = flights.find((f) => f.id === selectedId) ?? null;

  return (
    <section className="apron" aria-labelledby="apron-title">
      <div className="view-head">
        <h2 id="apron-title">APRON</h2>
        <p className="muted">
          {flights.length} {flights.length === 1 ? 'aircraft' : 'aircraft'} from <code>GET /flights</code>. The number on
          each tail is the flight <code>id</code>. Select an aircraft to see who's on board.
        </p>
      </div>

      {flights.length === 0 ? (
        <div className="empty-apron">
          <p className="screen-title">APRON IS EMPTY</p>
          <p>
            <code>GET /flights</code> returned no flights. Create one with <code>POST /flights</code> (see the README of
            flightservices), then press Refresh.
          </p>
        </div>
      ) : (
        <div className="tarmac">
          <div className="terminal-wall" aria-hidden="true" />
          <ul className="stands">
            {flights.map((f, i) => (
              <Stand
                key={f.id}
                flight={f}
                gate={i + 1}
                pax={byFlight.get(f.id)?.length ?? 0}
                onOpen={() => setSelectedId(f.id)}
              />
            ))}
          </ul>
        </div>
      )}

      <Modal open={selected != null} onClose={() => setSelectedId(null)} labelledBy="manifest-title">
        {selected && <Manifest flight={selected} reservations={byFlight.get(selected.id) ?? []} />}
      </Modal>
    </section>
  );
}

function Stand({ flight, gate, pax, onOpen }: { flight: Flight; gate: number; pax: number; onOpen: () => void }) {
  const livery = liveryFor(flight.operatingAirlines);
  return (
    <li className="stand">
      <div className="gate-sign">
        <span className="gate-no">GATE {String(gate).padStart(2, '0')}</span>
        <span className="gate-flight">{flight.flightNumber}</span>
      </div>
      <button
        className="plane-btn"
        onClick={onOpen}
        aria-label={`Flight ${flight.flightNumber}, tail ${flight.id}, ${flight.operatingAirlines}, ${flight.departureCity} to ${flight.arrivalCity}, ${pax} passenger${pax === 1 ? '' : 's'}. Open manifest.`}
      >
        <PlaneSprite livery={livery} tail={flight.id} />
      </button>
      <dl className="stand-info">
        <div>
          <dt className="sr-only">Route</dt>
          <dd className="route">
            {flight.departureCity} <span aria-hidden="true">→</span>
            <span className="sr-only">to</span> {flight.arrivalCity}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Departs</dt>
          <dd>
            {flight.dateOfDeparture} · {formatTime(flight.estimatedDepartureTime)}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Passengers</dt>
          <dd className={pax ? 'pax' : 'pax none'}>
            {pax} PAX
          </dd>
        </div>
      </dl>
    </li>
  );
}
