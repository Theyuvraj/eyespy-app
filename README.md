# EyeSpy

Static GitHub Pages build for the EyeSpy homework app, with Google Sheets persistence through a dedicated Apps Script backend.

## What to publish

- `index.html` is the GitHub Pages app.
- `.nojekyll` keeps GitHub Pages from rewriting the static build.
- `google-apps-script/Code.gs` is the Google Sheets backend.
- `google-apps-script/appsscript.json` is the Apps Script manifest.

## GitHub Pages

1. Create a new GitHub repository for EyeSpy.
2. Copy the contents of this folder to the repository root.
3. Enable GitHub Pages from the `main` branch and the root folder.
4. Open the published URL and use the app normally.

## Google Sheets backup backend

1. Create a new Google Spreadsheet for EyeSpy backups.
2. Open [script.google.com](https://script.google.com) and create a new Apps Script project.
3. Replace `Code.gs` with `google-apps-script/Code.gs`.
4. Update `DEFAULT_SPREADSHEET_ID` with the new spreadsheet ID.
5. Replace the manifest with `google-apps-script/appsscript.json`.
6. Deploy as a web app:
   - Execute as: `Me`
   - Who has access: `Anyone`
7. Copy the deployed `/exec` URL into the app settings or the placeholder constant in `index.html`.

## Verification

- Use Settings -> Test Connection to confirm the Apps Script endpoint responds.
- Save homework and submissions once to confirm data lands in the Google Sheet.
- Open the Backups modal after a save to confirm the local backup list is populated.

