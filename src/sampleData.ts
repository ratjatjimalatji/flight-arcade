import type { AirportData, Flight, Passenger, Reservation } from './types';

// South African sample rows (local airlines, domestic routes). Keep in sync with mock/server.mjs.
// Only used when you press "Use sample data" while the server is unreachable,
// and the UI labels it as sample data so it is never mistaken for a live response.

const flights: Flight[] = [
  [1, 'SA301', 'South African Airways', 'JNB', 'CPT', '2026-12-05', '2026-12-05T06:00:00'],
  [2, 'SA303', 'South African Airways', 'JNB', 'CPT', '2026-12-05', '2026-12-05T08:00:00'],
  [3, 'SA541', 'South African Airways', 'JNB', 'DUR', '2026-12-05', '2026-12-05T09:30:00'],
  [4, 'FA211', 'FlySafair', 'JNB', 'CPT', '2026-12-05', '2026-12-05T07:15:00'],
  [5, '4Z851', 'Airlink', 'CPT', 'PLZ', '2026-12-05', '2026-12-05T10:45:00'],
  [6, '4Z853', 'Airlink', 'CPT', 'GRJ', '2026-12-05', '2026-12-05T12:20:00'],
  [7, 'FA451', 'FlySafair', 'CPT', 'DUR', '2026-12-06', '2026-12-06T06:40:00'],
  [8, 'FA562', 'FlySafair', 'DUR', 'JNB', '2026-12-06', '2026-12-06T08:10:00'],
  [9, '5Z702', 'CemAir', 'JNB', 'BFN', '2026-12-06', '2026-12-06T09:50:00'],
  [10, '4Z162', 'Airlink', 'JNB', 'ELS', '2026-12-06', '2026-12-06T11:05:00'],
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
  { id: 1, firstName: 'Sipho', lastName: 'Dlamini', middleName: 'Bongani', email: 'sipho.dlamini@example.com', phone: '0825550101' },
  { id: 2, firstName: 'Lerato', lastName: 'Mokoena', middleName: null, email: 'lerato.mokoena@example.com', phone: '0835550102' },
  { id: 3, firstName: 'Pieter', lastName: 'van der Merwe', middleName: 'Johannes', email: 'pieter.vdm@example.com', phone: '0715550103' },
  { id: 4, firstName: 'Naledi', lastName: 'Khumalo', middleName: null, email: 'naledi.khumalo@example.com', phone: '0725550104' },
  { id: 5, firstName: 'Thabo', lastName: 'Nkosi', middleName: 'Sipho', email: 'thabo.nkosi@example.com', phone: '0845550105' },
  { id: 6, firstName: 'Ayesha', lastName: 'Patel', middleName: 'Zahra', email: 'ayesha.patel@example.com', phone: '0615550106' },
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
