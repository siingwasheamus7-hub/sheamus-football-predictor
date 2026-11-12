SHEAMUS FOOTBALL PREDICTOR — NETLIFY FIXED BUILD
================================================

WHAT THIS FIX CHANGES
- The browser no longer calls ESPN directly.
- A Netlify Function at /.netlify/functions/fixtures retrieves the ESPN scoreboard feed server-side.
- This avoids browser CORS restrictions on the direct ESPN request.
- Adds Under 2.5 estimates and refreshes fixtures every 60 seconds.

DEPLOYMENT
This project MUST be deployed to Netlify with the complete folder structure.
Do not upload only index.html. The netlify/functions/fixtures.js file and netlify.toml are required.

OPTION A — GitHub (recommended if your Netlify site is connected to GitHub)
1. Download and extract this ZIP on your phone.
2. Open the GitHub repository connected to your Netlify site.
3. Upload/replace the project files, keeping the folders exactly as shown:
   - index.html
   - sw.js
   - manifest.webmanifest
   - icon.svg
   - netlify.toml
   - netlify/functions/fixtures.js
4. Commit the changes to the branch Netlify deploys (often main).
5. Open Netlify > your site > Deploys and wait for the new deploy to say Published.
6. Open the site in Chrome, refresh it, and tap Refresh matches.

OPTION B — Netlify manual deploy
Use Netlify's manual deploy upload and upload the extracted project folder contents
with the netlify folder and netlify.toml included. If the mobile upload screen does
not preserve folders, use the GitHub method instead.

TROUBLESHOOTING
- If Netlify shows "Page not found" for /.netlify/functions/fixtures, the function was
  not deployed: confirm netlify.toml and netlify/functions/fixtures.js are in the repo.
- If the function returns a 502, the upstream ESPN feed may be temporarily unavailable.
- The endpoint is an unofficial public ESPN feed and is not guaranteed uptime or coverage.

PREDICTION LIMITATIONS
The current Poisson model still uses league-level average goal rates. It does not
analyse verified team form, injuries, confirmed lineups, or odds. Predictions are
estimates only, not guarantees or betting advice.

PWA
After successful HTTPS deployment, open the site in Chrome and choose Install app
or Add to Home screen. This is an installable web app, not a compiled APK.
