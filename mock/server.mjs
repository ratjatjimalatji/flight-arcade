// Tiny stand-in for the Spring Boot app, for working on the UI without EC2.
// Serves the same South African sample rows as src/sampleData.ts:  npm run mock
import http from 'node:http';

const flights = [
  [1, 'SA301', 'South African Airways', 'JNB', 'CPT', '2026-12-05', '06:00:00'],
  [2, 'SA303', 'South African Airways', 'JNB', 'CPT', '2026-12-05', '08:00:00'],
  [3, 'SA541', 'South African Airways', 'JNB', 'DUR', '2026-12-05', '09:30:00'],
  [4, 'FA211', 'FlySafair', 'JNB', 'CPT', '2026-12-05', '07:15:00'],
  [5, '4Z851', 'Airlink', 'CPT', 'PLZ', '2026-12-05', '10:45:00'],
  [6, '4Z853', 'Airlink', 'CPT', 'GRJ', '2026-12-05', '12:20:00'],
  [7, 'FA451', 'FlySafair', 'CPT', 'DUR', '2026-12-06', '06:40:00'],
  [8, 'FA562', 'FlySafair', 'DUR', 'JNB', '2026-12-06', '08:10:00'],
  [9, '5Z702', 'CemAir', 'JNB', 'BFN', '2026-12-06', '09:50:00'],
  [10, '4Z162', 'Airlink', 'JNB', 'ELS', '2026-12-06', '11:05:00'],
].map(([id, flightNumber, operatingAirlines, departureCity, arrivalCity, d, t]) => ({
  id, flightNumber, operatingAirlines, departureCity, arrivalCity,
  dateOfDeparture: d, estimatedDepartureTime: `${d}T${t}`,
}));

const passengers = [
  [1, 'Sipho', 'Dlamini', 'Bongani', 'sipho.dlamini@example.com', '0825550101'],
  [2, 'Lerato', 'Mokoena', null, 'lerato.mokoena@example.com', '0835550102'],
  [3, 'Pieter', 'van der Merwe', 'Johannes', 'pieter.vdm@example.com', '0715550103'],
  [4, 'Naledi', 'Khumalo', null, 'naledi.khumalo@example.com', '0725550104'],
  [5, 'Thabo', 'Nkosi', 'Sipho', 'thabo.nkosi@example.com', '0845550105'],
  [6, 'Ayesha', 'Patel', 'Zahra', 'ayesha.patel@example.com', '0615550106'],
].map(([id, firstName, lastName, middleName, email, phone]) => ({ id, firstName, lastName, middleName, email, phone }));

const reservations = [
  [1, true, 2, 1, 1], [2, false, 0, 2, 1], [3, true, 1, 3, 4],
  [4, false, 0, 4, 5], [5, true, 3, 5, 8], [6, false, 1, 6, 10],
].map(([id, checkedIn, numberOfBags, pid, fid]) => ({
  id, checkedIn, numberOfBags,
  passenger: passengers.find((p) => p.id === pid),
  flight: flights.find((f) => f.id === fid),
}));

const routes = { '/flights': flights, '/passengers': passengers, '/reservations': reservations };
const PORT = Number(process.env.PORT ?? 8080);

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // like @CrossOrigin
  const path = new URL(req.url, 'http://x').pathname.replace(/^\/flightservices/, '');
  const m = path.match(/^\/(flights|passengers|reservations)(?:\/(\d+))?$/);
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  if (req.method !== 'GET' || !m) return send(404, { status: 404, error: 'Not Found', message: `No mock for ${req.method} ${path}` });
  const list = routes[`/${m[1]}`];
  if (!m[2]) return send(200, list);
  const item = list.find((x) => x.id === Number(m[2]));
  return item ? send(200, item) : send(404, { status: 404, error: 'Not Found', message: `${m[1]} ${m[2]} not found` });
}).listen(PORT, () => console.log(`Mock flightservices on http://localhost:${PORT}/flightservices (read-only)`));
