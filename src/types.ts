// Mirrors the JPA entities in flightservices (com.bharath.flightreservation.entities).
// Spring Boot serialises LocalDate as "yyyy-MM-dd" and LocalDateTime as "yyyy-MM-ddTHH:mm:ss".

/** GET /flights  →  Flight[] */
export interface Flight {
  id: number;
  flightNumber: string;
  operatingAirlines: string;
  departureCity: string;
  arrivalCity: string;
  dateOfDeparture: string;
  estimatedDepartureTime: string | null;
}

/** GET /passengers  →  Passenger[] */
export interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string | null;
  phone: string | null;
}

/** GET /reservations  →  Reservation[] (flight and passenger are nested, eager-loaded) */
export interface Reservation {
  id: number;
  checkedIn: boolean | null;
  numberOfBags: number | null;
  passenger: Passenger | null;
  flight: Flight | null;
}

export interface AirportData {
  flights: Flight[];
  passengers: Passenger[];
  reservations: Reservation[];
}

export interface ApiLogEntry {
  id: number;
  method: string;
  path: string;
  status: number | 'ERR';
  ms: number;
  at: Date;
}
