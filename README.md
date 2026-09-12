# Zotero Toolit

A convenient browser extension which can check if the article exists in your Zotero collections.

It can extract DOIs from the web page. You can also paste the DOI you want to check.

---

## Screenshots

![Screenshot](pics/screenshot.png)

---

## How To Use

0. Go to `Edit -> Settings -> Advanced`, make sure `Allow other applications on this computer to communicate with Zotero` is enabled.

1. Clone this repo.
2. Install dependencies.

```bash
pnpm install
```

3. Build package.

```bash
pnpm build
```

4. Extract the zip file in `release` to the locationo you like.
5. Load unpacked extension in your browser.

## THANKS

- [crxjs](https://crxjs.dev/): Browser extension framework.
- [Tailwindcss](https://tailwindcss.com/): A utility-first CSS framework.
