# Team Contributions

## M1 Proposal & Setup

### Kuan Yi Li (kuanli-N01640969)
1. Problem and users
2. Features/Later
4. Data model draft
7. Team roles
8. Repo setup

### Abeer Rashid (AbeerRashid)
3. External API
5. Endpoint List

## Owen Fedchenko (Owenfeds)
1. Wireframes
2. Frontend dev
3. Later Features

### Maliki Cornwall-Douglas (MalikiC-D)
No assigned tasks for M1 (joined the group late)

## M2 Express REST API
### Abeer Rashid (AbeerRashid)
**App Core & Routing:** Implemented `api/app.js`, setting up Express, middleware execution order, and mounting modular routers.
- **Error Handling Architecture:** Built the custom `HttpError` class, the 404 fallback middleware (`notFound.js`), and the centralized global error handler (`errorHandler.js`).
- **Routers & Controllers:** Developed modular route groups and controller functions for managing logs, nested meals, and USDA search queries.
- **Pull Request:** [#9]
- **Removed duplicate gitignore file:** There was a root gitignore file and in calorie goal tracker folder. Have reviewed and removed the secondary file.
- **Pull Request:** [#14]

### Maliki Cornwall-Douglas (MalikiC-D)
- **Logs and meals CRUD:** I fixed the crashing meal handler, added the missing meal endpoints (list, get one, update, delete), updated create/update/delete for logs, and wired up the routes. New items get their IDs from `crypto.randomUUID()`.
- **Validation:** I added validation for every POST and PUT body on logs and meals. Bad input returns a 400 that lists each field that failed, and unknown IDs return a 404.
- **Testing and docs:** I ran every endpoint with curl in Git Bash, built the Bruno requests, and wrote the run steps, endpoint table and Testing section in `api/README.md`.
- **USDA fixes:** I fixed the bugs that stopped the USDA search from working so the demo runs.

## M3 Next.js Frontend
### Owen Fedchenko (Owenfeds)
**Wireframes & Navigation:** I set up the wireframes for the app and built a nav bar to navigate to each page, while making sure the sign in is the defualt home page that navigates to the daily log page.
- **API fetch handling:** Built the API service modules to fetch the API from the backend
- **Pages:** Built the front end code for the pages with the functions that call the API and forms to submit the daily logs.
- **CSS:** Added a globals.css to style the app. Could still use improvement.
- **Readme:** Wrote front end readme instructions
