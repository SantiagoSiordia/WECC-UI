# Admin View Feedback Call Summary

Source: `Saturday - Admin view feedback.m4a`

## Purpose

The call focused on refining the Admin View into a simpler, practical audit surface for WECC. The core goal is to let an admin understand how people are interacting with the RAG system: what sessions exist, what users asked, what the system returned, what citations were included, and which users/projects/files are involved.

The direction is to avoid overbuilding analytics in the first iteration. The UI should focus on the audit workflow first, then leave room for trends, anomalies, and richer analytics later.

## High-Level Direction

- Admin View should prioritize auditability and visibility over analytics.
- The UI should make it easy to inspect sessions, queries, responses, and citations.
- Detail views should be consistent across Audit Log, Users, and Projects.
- The interface should stay simple for now: do not add search, pagination, or analytics controls unless they become necessary.
- React is the preferred direction for the production UI because the admin experience requires more customization than Streamlit comfortably supports.

## Project Detail View

The project detail view should be reorganized around the admin's most important inspection path.

### Section Order

1. Sessions
2. Members
3. Files

### Sessions

- Rename `All Sessions` to `Sessions`.
- Sessions should appear at the top of the project detail view.
- Clicking a session should expand it inline.
- Expanded sessions should reveal the queries/prompts inside that session.
- Clicking a query should open the full query detail view.
- The admin does not need to see every session at once in the initial version.
- Most projects are expected to have a manageable number of files/users, and admins probably only care about the most recent sessions.

### Loading More

- Do not implement full pagination yet.
- Do not implement search yet.
- If the list needs to grow, use a simple **More** button that appends the next set of items to the page.
- Add search or stronger pagination later only if real usage shows that admins need it.

### Members

- The members/users section is generally fine as currently structured.
- Admins need the ability to remove members from a project.
- This can be a simple remove action in the members list.

### Files

- Files should remain scoped to the project.
- The current idea of grouping files by type/category is not necessary for WECC.
- Avoid a global file drawer or file grouping model that does not match the project-scoped workflow.
- If more files need to be shown, use a simple **More** button rather than search/pagination for now.

## User Detail View

The user detail view should let an admin understand which projects and sessions a user has interacted with.

### Required Behavior

- Clicking a user should show the projects they belong to.
- Project names in the user detail view should be clickable.
- Clicking a project should navigate to the Projects tab and open that project detail view.
- The recent activity section should show **recent sessions**, not recent query turns as a flat list.
- Each recent session should show:
  - Session name
  - Associated project, if project-scoped
  - Indication if it is a general/non-project chat

### Session Expansion

- Recent sessions should be collapsible.
- Expanding a session should show the queries/prompts inside that session.
- At that expanded level, the row does not need to repeat user, project, and session columns because those are already implied by the selected user/session context.
- The expanded query list should include:
  - Prompt / user input
  - Citation/status information where relevant
- Clicking a query should drill into the full query detail view.

## Project Detail View: Same Pattern As Users

The project detail view should apply the same session expansion pattern as the user detail view.

- Show sessions for the selected project.
- Clicking a session expands it.
- Expanded session content shows the queries/prompts inside that session.
- Clicking a query opens the full query detail view.
- This keeps the mental model consistent across Users and Projects.

## Audit Log View

The Audit Log view should stay focused and smaller.

### Keep

- Query volume chart.
- Top users.
- Top projects.
- Core audit table/list of query activity.

### Change

- Query volume should show activity over the **last week** instead of the last 12 hours.
- Top users should be based on total query count per user.
- Top projects should be based on total query count per project.

### Remove For Now

- Most cited files.
- Signals to watch.
- No-context answer metric/card.
- Avg citations card.
- Avg latency card.
- No-context rate card.
- Search prompt filter.
- Type filter.
- Analytics coming soon placeholder.
- Extra status noise that does not help the first audit workflow.

The overall goal is for the audit dashboard to be cleaner, smaller, and focused on the highest-value initial information.

## Audit Table / Query Lists

The table structure used in the Audit Log makes sense and can be reused conceptually in other contexts.

### Audit Log Table

The current structure with columns like when, user, project, session, prompt/event, and status is useful for the global audit view.

### User / Project Context

When showing queries inside an expanded session on a user or project detail page:

- Do not repeat user/project/session columns if they are already implied.
- Show the prompt/query.
- Show citation/status information.
- Clicking a prompt should open the detailed query view.

### Naming

- Avoid using `Query turn` as a visible user-facing title.
- Use `Query`, or omit the title when the user has already selected a query.
- If a list includes citation state, label it **Citations**.

## Query Detail View

The query detail view was strongly approved and should stay.

### Keep In The Detail View

- User input / prompt.
- Retrieval or mocked RAG pipeline information.
- Assistant response/output.
- Citation/snippet details.
- Query metadata such as model, latency, and token counts if available.

### Why This View Matters

The detail view helps distinguish between:

- What the RAG system retrieved from the project context.
- What citations/snippets were returned.
- What response was ultimately sent back to the user.

That distinction is important because the RAG retrieval output and the final customer-facing response are related but not identical.

### Backend Logging Requirement

The system should start storing this information per query. Ryan specifically liked the current detail view and wants this data logged for each query.

Coordinate with Muhammad so the backend records:

- User input.
- Assistant output.
- Retrieved snippets/chunks.
- Citations returned.
- Project/session/user identifiers.
- Query metadata such as timestamps, latency, tokens, model, and status where available.

## Product / Technical Direction

### React vs Streamlit

React is the preferred direction for this UI.

Reasons:

- The admin experience has become too custom for Streamlit to be the best long-term fit.
- Streamlit is useful for very fast initial builds, but it becomes less flexible for layered, polished audit workflows.
- The current prototype is already visually close and built in JSX.
- It can be refactored into a real React/TSX application and connected to APIs.

### Refactor Direction

- Treat the current prototype as a visual and interaction reference.
- Move toward a proper React application structure.
- Convert JSX toward TSX where useful.
- Connect the UI to backend APIs once available.

## Backend Expectations

Muhammad is expected to have most backend support ready this week.

Some admin-specific query-detail logging may still require coordination, especially the detailed per-query fields needed by the approved query detail view.

The frontend and backend should align on the audit data model early, especially around:

- Users.
- Projects.
- Sessions.
- Queries/prompts.
- Responses.
- Citations.
- Retrieved snippets/chunks.
- Files.
- Timestamps/status.

## File View Notes

- The admin file view should not become a global, type-sorted file explorer.
- Files should be viewed in the scope of a project.
- The existing global file drawer/type-grouping idea does not fit the WECC use case.
- If file access is needed, show files inside the relevant project context.

## Mobile Notes

- There is no mobile app requirement.
- The UI can be mobile-friendly, but mobile is not a priority.
- Access likely requires VPN, and mobile VPN support is not something to optimize for right now.

## Timeline And Delivery Expectations

- The goal is to work on this WECC admin implementation this week.
- Push code by Friday.
- Send a detailed status update when wrapping up.
- The target is to have something demo-ready enough for Mike to show on June 8-9.
- It does not need to be fully complete by then, but it should be complete enough to demonstrate the admin capability.

## Action Items

### UI Updates

- Rename `All Sessions` to `Sessions`.
- Reorder project detail sections to Sessions, Members, Files.
- Implement collapsible sessions in project detail.
- Implement collapsible sessions in user detail.
- Move query lists under their parent sessions.
- Let admins drill from session query list into query detail.
- Make project links clickable from user detail.
- Add member removal from project members list.
- Remove most cited files and signals cards from Audit Log.
- Remove no-context, average citation, and average latency metric cards.
- Remove search and type filters from Audit Log for now.
- Remove Analytics Coming Soon placeholder.
- Change query volume chart to last-week view.
- Remove or rename `Query turn` label.
- Use `Citations` as the label where citation status/count is shown.

### Backend / Data

- Coordinate with Muhammad on per-query audit logging.
- Confirm backend data shape for users, projects, sessions, queries, responses, citations, snippets, and files.
- Make sure the query detail view can be backed by real logged data.

### Implementation Strategy

- Continue using the current prototype as the visual reference.
- Prefer a React/TSX application path over expanding Streamlit.
- Connect the React UI to APIs as backend support becomes available.

## Open Questions

- Exact backend schema for per-query retrieval/citation logging.
- Whether query metadata such as latency, token count, and model will be available immediately.
- How much of member removal should be functional in the first demo versus mocked in UI.
- Whether the first demo needs real API-backed data or can use a mixed mocked/real data approach.

