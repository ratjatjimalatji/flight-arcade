import { useId, useMemo, useState } from 'react';
import type { AirportData, Passenger, Reservation } from '../types';
import { BagSprite, PersonSprite } from '../sprites';
import { bagColor, formatTime, fullName, lookFor } from '../look';
import { Modal } from '../components/Modal';

interface Traveller {
  passenger: Passenger;
  reservation: Reservation | null;
}

type Filter = 'all' | 'none' | number;

export function Terminal({ data }: { data: AirportData }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<number | null>(null);
  const selectId = useId();

  // GET /passengers is the full list; GET /reservations tells us which flight
  // each passenger is on, whether they checked in and how many bags they have.
  const travellers = useMemo<Traveller[]>(() => {
    const resByPassenger = new Map<number, Reservation>();
    for (const r of data.reservations) if (r.passenger) resByPassenger.set(r.passenger.id, r);
    return [...data.passengers]
      .sort((a, b) => a.id - b.id)
      .map((p) => ({ passenger: p, reservation: resByPassenger.get(p.id) ?? null }));
  }, [data]);

  const visible = travellers.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'none') return !t.reservation?.flight;
    return t.reservation?.flight?.id === filter;
  });

  // Checked-in passengers handed their bags over, so those bags come out on the belt.
  const beltBags = visible.flatMap((t) =>
    t.reservation?.checkedIn
      ? Array.from({ length: t.reservation.numberOfBags ?? 0 }, (_, i) => ({ t, i }))
      : [],
  );

  const flightOptions = [...data.flights].sort((a, b) => a.id - b.id);
  const open = travellers.find((t) => t.passenger.id === openId) ?? null;

  return (
    <section className="terminal" aria-labelledby="terminal-title">
      <div className="view-head">
        <h2 id="terminal-title">TERMINAL</h2>
        <p className="muted">
          {data.passengers.length} passengers from <code>GET /passengers</code>, joined with{' '}
          <code>GET /reservations</code> for flight, check-in and bags.
        </p>
        <div className="filter">
          <label htmlFor={selectId}>Show</label>
          <select
            id={selectId}
            value={String(filter)}
            onChange={(e) => {
              const v = e.target.value;
              setFilter(v === 'all' || v === 'none' ? v : Number(v));
            }}
          >
            <option value="all">All passengers</option>
            {flightOptions.map((f) => (
              <option key={f.id} value={f.id}>
                Tail {f.id} · {f.flightNumber} {f.departureCity}→{f.arrivalCity}
              </option>
            ))}
            <option value="none">No booking</option>
          </select>
        </div>
      </div>

      <div className="claim">
        <div className="claim-sign">
          <span>BAGGAGE CLAIM</span>
          <span className="claim-count">{beltBags.length} on belt</span>
        </div>
        <div className="carousel">
          <div className="belt">
            {beltBags.length === 0 ? (
              <span className="belt-empty">No checked bags for this selection</span>
            ) : (
              <ul className="belt-bags">
                {beltBags.map(({ t, i }) => (
                  <li key={`${t.passenger.id}-${i}`} title={`${fullName(t.passenger)} · ${t.reservation?.flight?.flightNumber ?? ''}`}>
                    <BagSprite color={bagColor(t.passenger.id, i)} scale={5} />
                    <span className="bag-tag">{t.passenger.lastName.slice(0, 6).toUpperCase()}</span>
                    <span className="sr-only">
                      Bag {i + 1} of {t.reservation?.numberOfBags} for {fullName(t.passenger)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <p className="legend muted">
          Checked in → bags were handed over and wait on the belt. Not checked in → passenger still carries them.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="empty-hall">
          <p className="screen-title">HALL IS QUIET</p>
          <p className="muted">
            {data.passengers.length === 0
              ? 'GET /passengers returned nobody. Book a seat with POST /reservations to create one.'
              : 'Nobody matches this filter.'}
          </p>
        </div>
      ) : (
        <ul className="hall">
          {visible.map((t) => (
            <TravellerCard key={t.passenger.id} t={t} onOpen={() => setOpenId(t.passenger.id)} />
          ))}
        </ul>
      )}

      <Modal open={open != null} onClose={() => setOpenId(null)} labelledBy="pax-title">
        {open && <PassengerDetail t={open} />}
      </Modal>
    </section>
  );
}

function statusOf(t: Traveller): { label: string; tone: string } {
  const r = t.reservation;
  if (!r?.flight) return { label: 'NO BOOKING', tone: 'muted' };
  const bags = r.numberOfBags ?? 0;
  if (r.checkedIn) return { label: bags ? `${bags} ON BELT` : 'CHECKED IN', tone: 'ok' };
  return { label: bags ? `CARRYING ${bags}` : 'NOT CHECKED IN', tone: 'warn' };
}

function TravellerCard({ t, onOpen }: { t: Traveller; onOpen: () => void }) {
  const { passenger: p, reservation: r } = t;
  const carrying = r && !r.checkedIn ? r.numberOfBags ?? 0 : 0;
  const status = statusOf(t);
  return (
    <li>
      <button
        className="traveller"
        onClick={onOpen}
        aria-label={`${fullName(p)}, ${r?.flight ? `flight ${r.flight.flightNumber}` : 'no booking'}, ${status.label.toLowerCase()}. Open details.`}
      >
        <PersonSprite
          look={lookFor(p.id)}
          scale={4}
          carrying={carrying}
          bagColors={Array.from({ length: carrying }, (_, i) => bagColor(p.id, i))}
        />
        <span className="traveller-name">{p.firstName} {p.lastName}</span>
        <span className="traveller-flight">{r?.flight ? `${r.flight.flightNumber} · TAIL ${r.flight.id}` : '—'}</span>
        <span className={`chip ${status.tone}`}>{status.label}</span>
      </button>
    </li>
  );
}

function PassengerDetail({ t }: { t: Traveller }) {
  const { passenger: p, reservation: r } = t;
  const bags = r?.numberOfBags ?? 0;
  return (
    <article className="pax-detail">
      <div className="pax-detail-sprite">
        <PersonSprite
          look={lookFor(p.id)}
          scale={5}
          carrying={r && !r.checkedIn ? bags : 0}
          bagColors={Array.from({ length: bags }, (_, i) => bagColor(p.id, i))}
        />
      </div>
      <div>
        <p className="eyebrow">PASSENGER #{p.id}</p>
        <h2 id="pax-title">{fullName(p)}</h2>
        <dl className="kv">
          <dt>Email</dt>
          <dd>{p.email || <span className="muted">not given</span>}</dd>
          <dt>Phone</dt>
          <dd>{p.phone || <span className="muted">not given</span>}</dd>
          {r?.flight ? (
            <>
              <dt>Flight</dt>
              <dd>
                {r.flight.flightNumber} · {r.flight.operatingAirlines} (tail {r.flight.id})
              </dd>
              <dt>Route</dt>
              <dd>
                {r.flight.departureCity} → {r.flight.arrivalCity}, {r.flight.dateOfDeparture}{' '}
                {formatTime(r.flight.estimatedDepartureTime)}
              </dd>
              <dt>Reservation</dt>
              <dd>#{r.id}</dd>
              <dt>Checked in</dt>
              <dd>{r.checkedIn ? 'Yes' : 'No'}</dd>
              <dt>Bags</dt>
              <dd>{bags}</dd>
            </>
          ) : (
            <>
              <dt>Booking</dt>
              <dd className="muted">No reservation — created via POST /passengers</dd>
            </>
          )}
        </dl>
        <p className="source muted">
          Source: <code>GET /passengers</code>
          {r && (
            <>
              {' '}+ <code>GET /reservations</code>
            </>
          )}
        </p>
      </div>
    </article>
  );
}
