# Client

The client is a React 19 + TypeScript single-page application built with Vite and Tailwind CSS. It uses React Router for navigation, TanStack Query for server state, Axios for API requests, and React Hook Form for form handling.

## Requirements

- Node.js 20 or later and npm.
- The server API running locally or at an accessible URL.

## Install and run

From the repository root:

```powershell
cd client
npm install
npm run dev
```

Vite serves the client on port `3000` by default. The login route is `/login`; authenticated application routes are currently scaffolded in `src/routes/AppRoutes.tsx`.

## Configuration

The Vite configuration loads `VITE_` variables from the repository-root `.env` file.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api/v1` | Versioned server API base URL. |
| `VITE_PORT` | `3000` | Local Vite development server port. |

The Axios client sends credentials (`withCredentials`) so browser requests can use the server's session cookie. Configure the server's `ALLOWED_ORIGINS` to include the client origin when the client and API use different origins.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm test` | Run the test suite. |
| `npm run lint` | Lint client source. |
