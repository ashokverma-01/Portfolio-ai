# MERN Microservices Migration Plan

> **For agentic workers:** Implement the requested migration in small, reviewable steps while preserving the current portfolio behavior.

**Goal:** Move the existing portfolio from a native Node/SQLite server to a React frontend and Express/MongoDB services, with Cloudinary for portrait uploads.

**Architecture:** Keep a single React/Vite frontend. Route `/api` through an Express gateway to separate portfolio, contact, and media services. Each service owns its Express routes and Mongoose models; MongoDB and Cloudinary values come only from environment variables. Migrate the original pages into React-rendered page components while retaining their visual design and browser interactions.

**Tech Stack:** React, Vite, Node.js, Express, Mongoose, MongoDB, Cloudinary, Multer.

**Spec:** User request and the original portfolio, blog, and contact pages, now migrated into React page components.

## Global Constraints

- Do not expose or overwrite existing `.env` values.
- Keep Cloudinary API secrets on the server only.
- Preserve current public routes and `/api` endpoint shapes where practical.
- Keep the original SQLite data available for the opt-in MongoDB migration.

## Review Focus

- Missing credentials must produce a clear, non-secret startup/configuration error.
- Database outages must not silently accept writes into memory.
- Image upload must reject non-image and oversized files and must never write local uploads.
- The three existing page routes and their API-driven features must remain available.

### Tasks

- [x] Build the React/Vite frontend shell and preserve the existing three page views.
- [x] Create the API gateway and independent portfolio, contact, and media services.
- [x] Add MongoDB models/routes, Cloudinary upload validation, and consistent errors.
- [x] Add safe environment examples, ignore rules, local run instructions, and build checks.
