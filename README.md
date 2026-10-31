# LNReader repo – LightNovelWorld (.net)

Custom LNReader plugin repository with one source: **https://lightnovelworld.net/**

## Setup (one time, ~2 minutes)

1. Create a **public** GitHub repo named `lnreader-repo`.
2. Upload everything in this folder to its `main` branch (keep the folder structure).
3. In `plugins.min.json`, replace `NAmwastaken324` with your GitHub username (2 places). Commit.
4. In LNReader: **More → Settings → Repositories → Add repository** and paste:

   ```
   https://raw.githubusercontent.com/NAmwastaken324/lnreader-repo/main/plugins.min.json
   ```

5. **Browse → Extensions/Plugins** → install **LightNovelWorld (.net)**.

## Notes

- The site uses Cloudflare. If you see "Cloudflare check" or "Could not reach site", open the source in **WebView** once (globe icon), let the page load, go back and refresh.
- Browse supports Popular / Latest, plus filters for order, status and genre. Search uses the site's search.
- `src/lightnovelworldnet.ts` is the source; `plugins/lightnovelworldnet.js` is the compiled file the app loads. If you change the plugin, bump `version` in both the code and `plugins.min.json` so the app offers the update.
