# Finish activating your wedding RSVPs

The RSVP form and storage code are installed in the Apps Script project attached to your spreadsheet. The form is not live yet.

Please complete these steps on a computer, signed into the Google account that owns your wedding spreadsheet:

1. Open your wedding RSVP spreadsheet and choose **Extensions → Apps Script**.
2. Click **Code.gs**. In the function dropdown next to Run, select **initializeRsvp**.
3. Click **Run**. Review Google's authorization prompt and authorize the Google Sheets access for this project. If Google shows a warning you do not recognize, stop and send Chris a screenshot before continuing.
4. Wait for **Execution completed**. Your spreadsheet should now have a formatted **RSVPs** tab. Leave its header names unchanged.
5. Click **Deploy → New deployment**. Choose **Web app** from the deployment type menu (gear icon).
6. Enter the description **Wedding RSVP form**. Set **Execute as** to **Me** (your account), and **Who has access** to **Anyone** so guests can submit without signing in. This opens the submission form; keep the spreadsheet itself Restricted.
7. Click **Deploy**, review any authorization prompts, and copy the **Web app URL** ending in **/exec**.
8. Send that URL to Chris. He will connect it to the website and verify test responses before opening RSVPs to guests.

The form collects name, email, attendance, invited plus-one, song request, and a note. Only the people you share the spreadsheet with can view the saved responses. Corrections are appended as new responses; use the latest response from each guest.

Google's deployment instructions: https://developers.google.com/apps-script/guides/web
