# بازی گنج صبح رویش

[اجرای مستقیم بازی](https://rsdplansobhroyesh-lang.github.io/sobh-royesh-treasure-game/)

یک ماجراجویی پنج‌مرحله‌ای فارسی و راست‌به‌چپ، ساخته‌شده با React، TypeScript و Vite. بازی شامل نقشهٔ گنج، چالش‌های حافظه، زمان، حدس تصویر، هزارتو و سودوکو، ذخیرهٔ پیشرفت در مرورگر و جشن پایانی است.

مراحل فقط به ترتیب و پس از تکمیل معتبر مرحلهٔ قبل باز می‌شوند. برای جزئیات کامل محصول، [MASTER_SPEC](docs/MASTER_SPEC.md) را ببینید.

## اجرای محلی

Node.js 24 و pnpm 11.19.0 لازم است.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## بررسی و ساخت

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

تست‌های مرورگر در اندازه‌های 390×844، 768×1024 و 1440×900 اجرا می‌شوند. برای استفاده از Chrome نصب‌شده در PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
pnpm test:e2e
```

## انتشار

هر push به شاخهٔ `main`، workflow فایل `.github/workflows/deploy-pages.yml` را اجرا می‌کند. این workflow وابستگی‌ها را نصب می‌کند، نسخهٔ production را می‌سازد و پوشهٔ `dist` را روی GitHub Pages منتشر می‌کند.

پیشرفت بازی با کلید `sobh-royesh:adventure` در `localStorage` همان مرورگر ذخیره می‌شود.
