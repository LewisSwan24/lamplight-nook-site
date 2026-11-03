# Lamplight Nook website

The one-page site for Lamplight Nook, with its privacy note and terms of use, served by GitHub Pages.
The HTML is generated; edit the sources and rebuild rather than editing the pages here.

- `content/en.json`, `content/zh.json`: the home page copy (hero, features, what you need, footer).
- `content/style.css`: the shared stylesheet.
- The privacy note and terms of use come from the app's own locales (`locales/<lang>.json`, `legal`),
  so the site always says what the app says.
- `img/<en|zh>-NN-name.jpg`: screenshots, made in the app's repository with `tools/sim/store.mjs`
  (it writes them to `store-out/site/`).

```bash
node build.mjs --app ../lamplight-nook
```
