# Private Google Sheets RSVP backend

Status: source prepared. Not live until a Google account authorizes and deploys it, and the deployment URL is configured.

1. Open the existing couple-owned RSVP spreadsheet, then choose **Extensions → Apps Script**. The prepared project contains `Code.gs`, `Form.html`, and `appsscript.json`.
2. For a new installation, copy the three files from this directory into the bound project. `Form.html` is generated with `node scripts/build-pages.mjs` using the public form markup, `form-styles.css`, and `form-client.js`.
3. Sign in as the couple's account. Select **initializeRsvp** in the editor's function dropdown, click **Run**, and review the requested Google Sheets permission.
4. Initialization creates an `RSVPs` tab in the existing spreadsheet, formats its headers, and records the spreadsheet ID privately in Script Properties. It preserves other tabs and existing response rows, and refuses to overwrite mismatched headers. The initialization entry point requires spreadsheet editor context and cannot initialize storage through the public web form. Re-running is safe.
5. Deploy → New deployment → Web app. Execute as **Me** and allow **Anyone** so invited guests do not need Google accounts. This publishes only the submission form; it does not share the spreadsheet. The account owner must review and authorize Google’s permission prompts. Workspace policies may prohibit anonymous deployments.
6. Copy the deployed URL ending in `/exec` into `google-apps-script/config.json` as `webAppUrl`.
7. Run `node scripts/build-pages.mjs`, then commit and push. GitHub Pages serves `docs`.
8. Test the public site while signed out of Google. Submit a clearly labeled test RSVP, verify its row in the private sheet, and verify a decline clears plus-one and song fields. Check desktop and mobile. A form receipt appears only after the sheet write has completed.

The form retains the wedding styling and runs inside Google’s HTML service iframe, so it uses Google’s supported `google.script.run` RPC instead of an unverified cross-origin POST. A direct form link is available if the guest’s browser blocks the embed. The public deployment URL is not a secret. There are no public functions for reading responses. The initialization entry point requires spreadsheet editor context; internal helpers end in `_` and cannot be invoked from the client.

Each new submission is appended. Retries with the same random request ID are deduplicated under a lock. Corrections are new rows rather than unauthenticated overwrites of a guest’s prior response. When reviewing, use the latest response from each guest; email identity is not verified. The sheet stores names, emails, attendance, plus-one names, song requests and notes; no data goes into GitHub. Spreadsheet formulas in guest input are escaped. A honeypot and short per-email rate limit discourage casual abuse; this is not an invitation verification or strong anti-bot system. Google quotas still apply.

The existing Node/SQLite server remains a separate local preview option and does not synchronize with Google Sheets. Its old local responses are not automatically uploaded.

After editing the form or backend, update the Google Apps Script deployment to a **new version**. Regenerating GitHub Pages alone does not update the deployed Google files.
