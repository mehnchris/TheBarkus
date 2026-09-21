# Private Google Sheets RSVP backend

Status: source prepared. Not live until a Google account authorizes and deploys it, and the deployment URL is configured.

1. Sign in at https://script.google.com and create a project named **Brandon & Hope RSVPs**.
2. Paste `Code.gs` into the project’s Code.gs file. Add an HTML file named **Form** and paste `Form.html` into it.
3. In Project Settings, enable showing the appsscript.json manifest. Replace its contents with the included manifest (Sheets permission only).
4. Run `setup_` from the editor and authorize it under the account that should own the responses. It creates one private spreadsheet and logs its URL. Re-running reuses the existing spreadsheet. Do not publish the spreadsheet or enable link sharing. If using an existing imported spreadsheet instead, set the script property `RSVP_SPREADSHEET_ID`, create an `RSVPs` tab, and copy the header names from `HEADERS_` to row 1 before running setup.
5. Deploy → New deployment → Web app. Execute as **Me** and allow **Anyone** so invited guests do not need Google accounts. This publishes only the submission form; it does not share the spreadsheet. The account owner must review and authorize Google’s permission prompts. Workspace policies may prohibit anonymous deployments.
6. Copy the deployed URL ending in `/exec` into `google-apps-script/config.json` as `webAppUrl`.
7. Run `node scripts/build-pages.mjs`, then commit and push. GitHub Pages serves `docs`.
8. Test the public site while signed out of Google. Submit a clearly labeled test RSVP, verify its row in the private sheet, and verify a decline clears plus-one and song fields. Check desktop and mobile. A form receipt appears only after the sheet write has completed.

The form retains the wedding styling and runs inside Google’s HTML service iframe, so it uses Google’s supported `google.script.run` RPC instead of an unverified cross-origin POST. A direct form link is available if the guest’s browser blocks the embed. The public deployment URL is not a secret. There are no public functions for reading responses, changing sheet IDs, or creating spreadsheets. Helper functions end in `_` and cannot be invoked from the client.

Each new submission is appended. Retries with the same random request ID are deduplicated under a lock. Corrections are new rows rather than unauthenticated overwrites of a guest’s prior response. When reviewing, use the latest response from each guest; email identity is not verified. The sheet stores names, emails, attendance, plus-one names, song requests and notes; no data goes into GitHub. Spreadsheet formulas in guest input are escaped. A honeypot and short per-email rate limit discourage casual abuse; this is not an invitation verification or strong anti-bot system. Google quotas still apply.

The existing Node/SQLite server remains a separate local preview option and does not synchronize with Google Sheets. Its old local responses are not automatically uploaded.

After editing the form or backend, update the Google Apps Script deployment to a **new version**. Regenerating GitHub Pages alone does not update the deployed Google files.
