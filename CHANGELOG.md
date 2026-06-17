# Changelog

---

## v3.0

### Changed
- Replaced EJS templating engine with plain HTML and the Fetch API
- All Express routes now return JSON instead of rendered HTML pages
- Route structure updated to follow REST API conventions — dashboard, orders, and settings now live under /api/
- Frontend pages handle their own rendering, auth redirects, and error states using fetch() and the DOM
- isLoggedIn middleware now returns 401 JSON instead of redirecting — redirect logic moved to the frontend
- Removed EJS as a dependency entirely
- Removed the views/ folder

### Added
- Seven standalone HTML pages in public/ replacing the EJS views
- /auth/me endpoint for frontend pages to check session state
- Explanation panel on the order page now renders dynamically from API response data
- Forbidden state handled inline on order.html rather than as a separate redirect

---

## v2.0

### Added
- Three difficulty levels: Low, Medium, and High — inspired by DVWA
- Settings page to switch between difficulty levels
- Difficulty stored in session so it persists while logged in
- UUID column added to orders table for High difficulty
- Base64 encoded IDs for Medium difficulty
- Dashboard order links now update dynamically based on active difficulty
- Difficulty badge in the navbar showing the current active level
- Per-difficulty explanation on the order detail page with relevant code snippets

### Changed
- Single orders route now handles all three difficulty behaviors
- Dashboard navbar updated to include Settings link
- order.ejs updated to show difficulty-specific context
- Database seeder updated to generate a UUID for each order on first run

---

## v1.0

### Added
- IDOR vulnerability lab with a realistic e-commerce order system
- Vulnerable route at `/orders/:id` with no ownership check
- Secure route at `/secure/orders/:id` showing the correct fix
- Session-based authentication — register, login, logout
- Two pre-seeded users with multiple orders each
- Learn page explaining IDOR, its root cause, and the fix
- Forbidden page shown on unauthorized access attempts
- Dark themed UI with animations and hover effects
- Docker support