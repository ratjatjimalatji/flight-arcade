# Flightservices · Ground Control

An 8-bit airport frontend for the [flightservices](https://github.com/ratjatjimalatji/flightservices)
Spring Boot API. Every plane, passenger and bag on screen comes from the API.

- **Apron** – one aircraft per flight from `GET /flights`. The number on the tail is the flight `id`.
  Click (or Tab + Enter) a plane to open its cabin manifest.
- **Terminal** – every passenger from `GET /passengers`, joined with `GET /reservations` for
  their flight, check-in state and bag count. Checked-in passengers' bags wait on the baggage belt;
  passengers who haven't checked in carry their bags.
- **Radio log** (bottom bar) – every HTTP call the page made, with status and timing, so you can
  watch the frontend ↔ backend round trip.

Stack: Vite + React + TypeScript. No UI library; sprites are plain SVG rectangles.

## How the UI maps to the backend

| On screen | Endpoint | Fields used |
|---|---|---|
| Plane at a gate, tail number | `GET /flights` | `id` (tail), `flightNumber`, `operatingAirlines` (livery colour), `departureCity`, `arrivalCity`, `dateOfDeparture`, `estimatedDepartureTime` |
| PAX count under each plane, cabin manifest | `GET /reservations` | grouped by `flight.id`; `passenger`, `checkedIn`, `numberOfBags` |
| People in the terminal | `GET /passengers` | `id` (outfit is derived from it), names, `email`, `phone` |
| Bags on the belt / in hand | `GET /reservations` | `checkedIn`, `numberOfBags` |

`Passenger` has no flight of its own in the backend – the link is the `Reservation` entity – which
is why the manifest is built from `/reservations`.

Code to read first: `src/api.ts` (all HTTP), `src/types.ts` (mirrors the JPA entities).

## Run it

Needs Node 20+.

```powershell
npm install
npm run dev
```

Open http://localhost:5173 and put your API address in the **API base URL** bar:

```
http://YOUR-EC2-PUBLIC-DNS:8080/flightservices
```

Keep `/flightservices` on the end – it's `server.servlet.context-path` in `application.properties`.
The address is remembered in the browser. To set a default instead, copy `.env.example` to
`.env.local` and edit `VITE_API_BASE`.

**No EC2 running?** Either press *Use flightdb.sql sample* on the error screen (clearly labelled as
sample data), or run a read-only mock of the API with the same rows:

```powershell
npm run mock      # serves http://localhost:8080/flightservices
```

CORS already works: every controller in flightservices has `@CrossOrigin`.

## Deploy the frontend to S3 (static website)

This gives you the full AWS picture: **S3 hosts the frontend, EC2 runs the Spring Boot API.**

```powershell
# 1. Build with your EC2 address baked in
$env:VITE_API_BASE = "http://YOUR-EC2-PUBLIC-DNS:8080/flightservices"
npm run build

# 2. Create a bucket and turn on static website hosting (one time)
aws s3 mb s3://YOUR-BUCKET-NAME
aws s3 website s3://YOUR-BUCKET-NAME --index-document index.html
aws s3api put-public-access-block --bucket YOUR-BUCKET-NAME `
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
aws s3api put-bucket-policy --bucket YOUR-BUCKET-NAME --policy '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::YOUR-BUCKET-NAME/*\"}]}'

# 3. Upload (run again after every build)
aws s3 sync dist s3://YOUR-BUCKET-NAME --delete
```

Open `http://YOUR-BUCKET-NAME.s3-website.<region>.amazonaws.com`.

Notes:
- The S3 website endpoint is **http**, which matches the EC2 API on http. If you later put the site
  behind CloudFront (https), the API must be https too, or browsers block the calls (mixed content).
- The EC2 security group must allow port 8080 from wherever the browser is – the browser calls EC2
  directly, not through S3.
- The EC2 public DNS changes when the instance stops and starts. Either re-type it in the API bar or
  attach an Elastic IP.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run mock` | Read-only mock of the API with the flightdb.sql rows |
