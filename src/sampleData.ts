import type { AirportData, Flight, Passenger, Reservation } from './types';

// The exact rows loaded by flightdb.sql in the flightservices repo.
// Only used when you press "Use flightdb.sql sample" while the server is unreachable,
// and the UI labels it as sample data so it is never mistaken for a live response.

const flights: Flight[] = [
  [1, 'AA1', 'American Airlines', 'AUS', 'NYC', '2018-02-05', '2018-02-05T03:14:07'],
  [2, 'AA2', 'American Airlines', 'AUS', 'NYC', '2018-02-05', '2018-02-05T05:14:07'],
  [3, 'AA3', 'American Airlines', 'AUS', 'NYC', '2018-02-05', '2018-02-05T06:14:07'],
  [4, 'SW1', 'South West', 'AUS', 'NYC', '2018-02-05', '2018-02-05T07:14:07'],
  [5, 'UA1', 'United Airlines', 'NYC', 'DAL', '2018-02-05', '2018-02-05T10:14:07'],
  [6, 'UA1', 'United Airlines', 'NYC', 'DAL', '2018-02-05', '2018-02-05T10:14:07'],
  [7, 'SW1', 'South West', 'AUS', 'NYC', '2018-02-06', '2018-02-06T07:14:07'],
  [8, 'SW2', 'South West', 'AUS', 'NYC', '2018-02-06', '2018-02-06T08:14:07'],
  [9, 'SW3', 'South West', 'NYC', 'DAL', '2018-02-06', '2018-02-06T10:14:07'],
  [10, 'UA1', 'United Airlines', 'NYC', 'DAL', '2018-02-06', '2018-02-06T10:14:07'],
].map(([id, flightNumber, operatingAirlines, departureCity, arrivalCity, dateOfDeparture, estimatedDepartureTime]) => ({
  id: id as number,
  flightNumber: flightNumber as string,
  operatingAirlines: operatingAirlines as string,
  departureCity: departureCity as string,
  arrivalCity: arrivalCity as string,
  dateOfDeparture: dateOfDeparture as string,
  estimatedDepartureTime: estimatedDepartureTime as string,
}));

const passengers: Passenger[] = [
  { id: 1, firstName: 'John', lastName: 'Smith', middleName: 'Michael', email: 'john.smith@example.com', phone: '5125550101' },
  { id: 2, firstName: 'Emily', lastName: 'Johnson', middleName: null, email: 'emily.johnson@example.com', phone: '5125550102' },
  { id: 3, firstName: 'Carlos', lastName: 'Rivera', middleName: 'Antonio', email: 'carlos.rivera@example.com', phone: '2125550103' },
  { id: 4, firstName: 'Aisha', lastName: 'Khan', middleName: null, email: 'aisha.khan@example.com', phone: '2125550104' },
  { id: 5, firstName: 'Thabo', lastName: 'Nkosi', middleName: 'Sipho', email: 'thabo.nkosi@example.com', phone: '2145550105' },
  { id: 6, firstName: 'Sarah', lastName: 'Williams', middleName: 'Jane', email: 'sarah.w@example.com', phone: '2145550106' },
];

// (id, checkedIn, bags, passengerId, flightId)
const reservations: Reservation[] = [
  [1, true, 2, 1, 1],
  [2, false, 0, 2, 1],
  [3, true, 1, 3, 4],
  [4, false, 0, 4, 5],
  [5, true, 3, 5, 8],
  [6, false, 1, 6, 10],
].map(([id, checkedIn, numberOfBags, pid, fid]) => ({
  id: id as number,
  checkedIn: checkedIn as boolean,
  numberOfBags: numberOfBags as number,
  passenger: passengers.find((p) => p.id === pid) ?? null,
  flight: flights.find((f) => f.id === fid) ?? null,
}));

export const SAMPLE_DATA: AirportData = { flights, passengers, reservations };
