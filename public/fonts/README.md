# Licensed IranSans font files

No IranSans font files are distributed with this project. The interface uses an installed IranSans font when available, followed by Tahoma, Segoe UI, Arial, and the browser sans-serif font. Font selection is centralized in `src/styles/fonts.css` and the `--font-persian` token in `src/styles/tokens.css`.

When the organizer supplies IranSans files licensed for web embedding:

1. Put the licensed WOFF2 files in this directory, for example `IRANSans-Regular.woff2` and `IRANSans-Bold.woff2`.
2. Add matching `@font-face` declarations to `src/styles/fonts.css`, using the family name `IranSans Licensed`, `font-display: swap`, and the corresponding font weights. This family is already first in `--font-persian`.
3. Reference the files using Vite's public-asset handling and verify the build beneath the configured repository base path. For a `public/fonts/IRANSans-Regular.woff2` asset, use `url('/fonts/IRANSans-Regular.woff2')` in the Vite-processed stylesheet; Vite adjusts the built reference to the configured base path.
4. Keep font licensing documentation with the supplied assets and only distribute files permitted by that license.

The current local font declarations make no font-file network requests. Do not add URL declarations for files that are not present, and do not obtain unlicensed font downloads. If a variable font is supplied, use the weight range and family metadata declared by that file instead of assuming static-font names.
