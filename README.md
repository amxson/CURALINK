# CuraLink

Doctor appointment and care coordination platform using React, TypeScript, Express, and MongoDB.

## Features

- Patient registration, profiles, password changes, and password reset email.
- Doctor directory with specialization filters, appointments and OPD bookings.
- Doctor applications, admin approval, patient and doctor management, analytics.
- Admin staff creation for doctors and laboratory technicians.
- Lab requests, technician worklists, result uploads, patient histories and report downloads.
- Doctor prescriptions and patient prescription history.
- Notifications and contact message management.
- Gemini assistant with department matching and doctor cards.

## Local setup

Use Node.js 22. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env.local`, then configure your own values.

```sh
cd server
npm ci
npm start
# In another terminal
cd client
npm ci --legacy-peer-deps
npm start
```

## Deployment

Frontend: Vercel project **curalink**, root directory `client`, install `npm ci --legacy-peer-deps`, build `npm run build`, output `build`. Production URL: https://curalink.vercel.app.

Backend: existing Render service, root directory `server`, install `npm ci`, start `npm start`. `render.yaml` documents the service configuration. Set `CLIENT_URL=https://curalink.vercel.app` and configure MongoDB, JWT, session, Gemini and email environment values on Render. Set Vercel's `REACT_APP_SERVER_DOMAIN` to this service's URL. All API requests, including report downloads, use that setting.

`GET /api/health` reports the API service and database connection state. Gemini and password reset email require their respective service credentials.

## Validation

```sh
cd client
npm run build
cd ../server
npm test
```

## Source attribution

CuraLink's original appointment system is maintained in `amxson/CURALINK`. The expanded lab, prescription, staff, OPD and assistant workflows were adapted from [MAYSHLMAY/cura_link](https://github.com/MAYSHLMAY/cura_link/tree/04c051b), with CuraLink branding and integration fixes. Generated builds and database seed scripts are excluded from this import.
