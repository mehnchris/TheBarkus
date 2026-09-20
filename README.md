# Brandon & Hope — Wedding website

A responsive, editable HTML/CSS/JavaScript website based on the supplied wedding intake. Includes a Node.js server and private SQLite RSVP storage. No npm dependencies or build step.

## Open in Visual Studio Code

Open this folder in VS Code. Requires Node.js 24 or newer.

```powershell
npm start
```

Visit http://127.0.0.1:3000. You can also press F5 using the included **Wedding website** launch configuration. `npm run dev` restarts the server after edits. Refresh the browser after changing page files.

## Edit the website

- `public/index.html`: wedding details, story, travel suggestions, and RSVP form.
- `public/styles.css`: palette, typography, layout, and responsive styles.
- `public/app.js`: navigation, countdown, and RSVP behavior.
- `public/wedding.ics`: calendar event. The ceremony is 5 PM Central (22:00 UTC) on April 23, 2027. An end time is intentionally omitted because none was provided.
- `server.mjs`: private RSVP API and static web server.

The typography uses Google Fonts with local system font fallbacks. The rest of the website runs without external assets. No couple photos, hotel booking links, room block rates, or registry URLs were supplied; these have not been invented. Photos can be added to `public` and explicitly mapped in the server's asset allowlist.

## Private RSVPs

Responses are saved in `data/rsvps.sqlite`, outside the public directory. There is no public guest list or API for reading responses. Name and email together identify a response; resubmitting the same pair updates that response. Declining clears the plus-one and song fields. No email confirmation is sent. The form is not an invitation verification system: guests are asked to follow their invitations.

Export responses locally:

```powershell
npm run export:rsvps
```

The private CSV is written under `data`. Keep this folder and exports restricted to the couple and authorized administrators. Back up the database with a SQLite-aware backup or stop the server before copying the data folder. Do not place exports in `public` or commit them to source control. For stronger local privacy, use Windows account permissions or encrypted storage; the database is not encrypted at rest.

## Checks

```powershell
npm test
```

Tests exercise real HTTP requests and temporary SQLite storage, including duplicate updates, declining, input validation, origin checks, and blocked public access to private files. Test responses never enter the real guest database.

## Before going live

This delivery is a local VS Code project, not a published website. Use Node.js 24+ hosting with HTTPS and a persistent private disk. Static-only hosting cannot run the RSVP endpoint. Set `HOST=0.0.0.0` for a hosted service, `PORT` as required by the provider, and `DATA_DIR` to its persistent private storage location. Configure reverse-proxy rate limiting for public deployment (the built-in limiter uses the immediate connection address). Review the final details and add the photos and registry when ready. The server displays the RSVP deadline but continues to accept late responses so guests can update their plans.

The primary contact email from the intake has intentionally not been included in the public website. A gentle remembrance has been included with the user's permission.

## GitHub Pages preview
The public preview is published from the docs folder on main. It explicitly does not collect RSVPs. Regenerate it after edits with: node scripts/build-pages.mjs. The full RSVP-capable website remains in public and runs with npm start. Never copy the data folder into docs.

