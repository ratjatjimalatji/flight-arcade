// Tiny stand-in for the Spring Boot app, for working on the UI without EC2.
// Serves the flightdb.sql sample rows at the same paths:  npm run mock
import http from 'node:http';

const flights = [
  [1, 'AA1', 'American Airlines', 'AUS', 'NYC', '2018-02-05', '03:14:07'],
  [2, 'AA2', 'American Airlines', 'AUS', 'NYC', '2018-02-05', '05:14:07'],
  [3, 'AA3', 'American Airlines', 'AUS', 'NYC', '2018-02-05', '06:14:07'],
  [4, 'SW1', 'South West', 'AUS', 'NYC', '2018-02-05', '07:14:07'],
  [5, 'UA1', 'United Airlines', 'NYC', 'DAL', '2018-02-05', '10:14:07'],
  [6, 'UA1', 'United Airlines', 'NYC', 'DAL', '2018-02-05', '10:14:07'],
  [7, 'SW1', 'South West', 'AUS', 'NYC', '2018-02-06', '07:14:07'],
  [8, 'SW2', 'South West', 'AUS', 'NYC', '2018-02-06', '08:14:07'],
  [9, 'SW3', 'South West', 'NYC', 'DAL', '2018-02-06', '10:14:07'],
  [10, 'UA1', 'United Airlines', 'NYC', 'DAL', '2018-02-06', '10:14:07'],
].map(([id, flightNumber, operatingAirlines, departureCity, arrivalCity, d, t]) => ({
  id, flightNumber, operatingAirlines, departureCity, arrivalCity,
  dateOfDeparture: d, estimatedDepartureTime: `${d}T${t}`,
}));

const passengers = [
  [1, 'John', 'Smith', 'Michael', 'john.smith@example.com', '5125550101'],
  [2, 'Emily', 'Johnson', null, 'emily.johnson@example.com', '5125550102'],
  [3, 'Carlos', 'Rivera', 'Antonio', 'carlos.rivera@example.com', '2125550103'],
  [4, 'Aisha', 'Khan', null, 'aisha.khan@example.com', '2125550104'],
  [5, 'Thabo', 'Nkosi', 'Sipho', 'thabo.nkosi@example.com', '2145550105'],
  [6, 'Sarah', 'Williams', 'Jane', 'sarah.w@example.com', '2145550106'],
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
