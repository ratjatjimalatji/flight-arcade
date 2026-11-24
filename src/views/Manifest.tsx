import type { Flight, Reservation } from '../types';
import { PlaneSprite, SeatedSprite } from '../sprites';
import { formatTime, fullName, liveryFor, lookFor } from '../look';

export function Manifest({ flight, reservations }: { flight: Flight; reservations: Reservation[] }) {
  const livery = liveryFor(flight.operatingAirlines);
  const onBoard = reservations.filter((r) => r.passenger);

  return (
    <article className="manifest">
      <header className="manifest-head">
        <div className="manifest-plane">
          <PlaneSprite livery={livery} tail={flight.id} scale={3} />
        </div>
        <div>
          <p className="eyebrow">CABIN MANIFEST · TAIL {flight.id}</p>
          <h2 id="manifest-title">
            {flight.flightNumber} <span className="muted">{flight.operatingAirlines}</span>
          </h2>
          <p className="route big">
            {flight.departureCity} → {flight.arrivalCity}
          </p>
          <p className="muted">
            {flight.dateOfDeparture} · ETD {formatTime(flight.estimatedDepartureTime)}
          </p>
        </div>
      </header>

      <div className="cabin" aria-hidden="true" style={{ borderColor: livery }}>
        {onBoard.length === 0 ? (
          <span className="cabin-empty">empty cabin</span>
        ) : (
          onBoard.map((r) => <SeatedSprite key={r.id} look={lookFor(r.passenger!.id)} />)
        )}
      </div>

      {onBoard.length === 0 ? (
        <div className="manifest-empty">
          <p>No reservations on this flight yet.</p>
          <p className="muted">
            Book one with <code>POST /reservations</code> and body{' '}
            <code>{`{"flightId": ${flight.id}, "passengerFirstName": "…", "passengerLastName": "…"}`}</code>, then Refresh.
          </p>
        </div>
      ) : (
        <table className="pax-table">
          <caption className="sr-only">Passengers on flight {flight.flightNumber}</caption>
          <thead>
            <tr>
              <th scope="col">Passenger</th>
              <th scope="col">Res #</th>
              <th scope="col">Checked in</th>
              <th scope="col">Bags</th>
            </tr>
          </thead>
          <tbody>
            {onBoard.map((r) => {
              const p = r.passenger!;
              return (
                <tr key={r.id}>
                  <td>
                    <span className="pax-name" title={fullName(p)}>{fullName(p)}</span>
                    {p.email && <span className="pax-email muted">{p.email}</span>}
                  </td>
                  <td>{r.id}</td>
                  <td>{r.checkedIn ? <span className="ok">YES</span> : <span className="muted">NO</span>}</td>
                  <td>{r.numberOfBags ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <p className="source muted">
        Source: <code>GET /reservations</code> where <code>flight.id = {flight.id}</code>
      </p>
    </article>
  );
}
