import type { AirportData, ApiLogEntry, Flight, Passenger, Reservation } from './types';

const STORAGE_KEY = 'flight-arcade.apiBase';

/**
 * Where the Spring Boot app lives. Includes the context path from
 * application.properties (server.servlet.context-path=/flightservices).
 *   Local:  http://localhost:8080/flightservices
 *   EC2:    http://ec2-1-2-3-4.eu-north-1.compute.amazonaws.com:8080/flightservices
 */
export const DEFAULT_API_BASE: string =
  import.meta.env.VITE_API_BASE ?? 'http://localhost:8080/flightservices';

export function loadApiBase(): string {
  try {
    return normaliseBase(localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE);
  } catch {
    return normaliseBase(DEFAULT_API_BASE);
  }
}

export function saveApiBase(base: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, base);
  } catch {
    /* storage unavailable: the value still applies for this visit */
  }
}

/**
 * The base must end at the context path (/flightservices). People often paste a
 * full endpoint URL such as .../flightservices/flights; the app then calls
 * /flights/flights, Spring tries to turn "flights" into the Long {id} of
 * GET /flights/{id}, and GlobalExceptionHandler answers 400 "Malformed request".
 * So strip any endpoint path (and query string) after the context path.
 */
export function normaliseBase(input: string): string {
  let base = input.trim().replace(/[?#].*$/, '').replace(/\/+$/, '');
  if (base && !/^https?:\/\//i.test(base)) base = `http://${base}`;
  const m = base.match(/^(.*?\/flightservices)(?:\/.*)?$/i);
  if (m) return m[1];
  // No context path given: drop a trailing endpoint name if there is one.
  return base.replace(/\/(flights|passengers|reservations|actuator)(\/.*)?$/i, '');
}

export class ApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.status = status;
  }
}

type Logger = (entry: Omit<ApiLogEntry, 'id' | 'at'>) => void;

async function getJson<T>(base: string, path: string, log: Logger): Promise<T> {
  const started = performance.now();
  let res: Response;
  try {
    res = await fetch(base + path, { headers: { Accept: 'application/json' } });
  } catch {
    log({ method: 'GET', path, status: 'ERR', ms: Math.round(performance.now() - started) });
    throw new ApiError(
      `No answer from ${base}. Is the app running, and is port 8080 open in the EC2 security group?`,
      null,
    );
  }
  log({ method: 'GET', path, status: res.status, ms: Math.round(performance.now() - started) });
  if (!res.ok) {
    // GlobalExceptionHandler returns { timestamp, status, error, message }
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.message) message = `${res.status}: ${body.message}`;
    } catch {
      /* not JSON */
    }
    if (res.status === 404 && !/\/flightservices$/i.test(base)) {
      message += '. The URL should end with /flightservices (the context path).';
    }
    throw new ApiError(`GET ${base}${path} failed — ${message}`, res.status);
  }
  return res.json() as Promise<T>;
}

/** Loads everything the airport needs in parallel. */
export async function loadAirport(base: string, log: Logger): Promise<AirportData> {
  const [flights, reservations, passengers] = await Promise.all([
    getJson<Flight[]>(base, '/flights', log),
    getJson<Reservation[]>(base, '/reservations', log),
    getJson<Passenger[]>(base, '/passengers', log),
  ]);
  return { flights, reservations, passengers };
}
