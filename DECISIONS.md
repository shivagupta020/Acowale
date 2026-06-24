# Engineering Decision Log

## 1. Why did you choose this technology stack?

React and Vite provide a small, fast client with enough flexibility for a polished public form and data-heavy dashboard. Express keeps the API explicit and easy to review. Both use JavaScript, reducing context switching and making the project straightforward for a small team to continue.

## 2. Why did you choose this database?

For this first version I chose an atomic JSON file. It requires no external account or local database setup, is deployable on any Node host with a persistent disk, and is transparent during evaluation. Writes go to a temporary file before rename to avoid partially written data. This is deliberately a version-one choice, not the final architecture: PostgreSQL would be my next step once concurrent writes, richer reporting, or multiple API instances are required.

## 3. Why did you structure your application this way?

The backend separates configuration, authentication, validation, persistence, and logging from HTTP route wiring. That keeps each concern small without introducing a framework-heavy architecture for a compact API. The frontend keeps its three product states—public form, admin login, and dashboard—in focused components. The boundary is the JSON API, so the frontend and backend can be deployed and evolved independently.

## 4. What trade-offs did you make due to time constraints?

I used a single-admin password and a file store rather than user accounts, roles, password recovery, and PostgreSQL. Analytics are calculated on demand because the initial dataset is small. The frontend uses one application module rather than introducing routing and a component library. These choices reduce operational setup while preserving clean seams for later replacement.

## 5. What would you improve with one more week?

I would migrate persistence to PostgreSQL with schema migrations and indexed full-text search, add role-based user accounts, add date and rating filters, provide CSV export, build a feedback-detail workflow with statuses and internal notes, and create an accessible design-system component layer. I would also add the delivery and reliability work intentionally excluded from this submission's scope.

## 6. What was the most difficult technical challenge?

The difficult part was balancing product polish with production awareness in a deliberately small codebase. The dashboard needed useful information rather than decorative metrics, while the API needed strict validation, safe errors, persistent storage, CORS controls, expiring authentication, and a deployment path without burying the assignment in infrastructure.

## 7. Which AI tools did you use?

I used OpenAI Codex as a coding collaborator to inspect the brief and repository, develop an implementation checklist, generate and refine code, and run local verification commands.

## 8. Share one instance where AI helped you.

AI helped convert the product brief into an end-to-end contract: required fields, validation rules, API response shapes, protected admin access, analytics, search, filtering, and the matching frontend states. That reduced gaps between the UI and API and kept the implementation aligned with the evaluation criteria.

## 9. Share one instance where you disagreed with AI and why?

An early direction could have added dependencies for a database, charting library, authentication package, and icon set. I kept the dependency surface intentionally small. For this evaluation, built-in Node capabilities and CSS visualizations make the solution easier to run and explain; heavyweight infrastructure would add setup before it added meaningful product value.

## 10. What would break first at 100,000 users?

The file-backed data layer. Concurrent writes from multiple processes could overwrite each other, every analytics request scans the full dataset, and instances cannot safely share a local file. I would first move data to managed PostgreSQL, add indexes and server-side aggregation, then introduce caching for summaries and cursor pagination for submissions. The stateless signed sessions already allow the API layer itself to scale after persistence moves out.

## 11. What would you improve, change, or challenge in this assignment?

I would add one explicit product constraint: define who acts on feedback after it arrives. Submission and analysis are useful, but feedback becomes valuable when it enters a workflow. Even a minimal status such as `new`, `reviewed`, and `planned`, plus an owner, would reveal more about domain modelling and turn the dashboard from a report into an operating tool.

