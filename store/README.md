# Chrome Web Store images

The images uploaded with the store listing. The listing's text and form answers are in [WEBSTORE_LISTING.md](../WEBSTORE_LISTING.md).

| File | Size | Use |
| --- | --- | --- |
| `screenshot-1-transcript.png` | 1280x800 | Screenshot 1: an opened meeting |
| `screenshot-2-meetings.png` | 1280x800 | Screenshot 2: the meetings list |
| `screenshot-3-text-file.png` | 1280x800 | Screenshot 3: a downloaded transcript |
| `promo-tile-440x280.png` | 440x280 | Small promo tile |

## Remaking them

Each image is a page in `source/`: a headline next to a capture of the real extension (`source/capture-*.png`). To change one, edit its page or replace its capture, then run:

```bash
npm run store-images
```

It renders every page at its exact size with the Chrome installed on your machine (set `CHROME_PATH` if Chrome is somewhere unusual).

The captures show invented meetings only. To take new ones, load the extension in a separate Chrome profile and fill it with `scripts/demo-meetings.js` (instructions at the top of that file); zoom the Meet page to 200% before capturing the panel, so the capture is sharp.
