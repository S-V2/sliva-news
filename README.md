# Sliva News

Portal editorial berita hewan, pet care, fauna, dan konservasi Indonesia.

## Fitur

- headline newsroom dan pilihan redaksi
- filter kategori dan pencarian
- detail artikel berbentuk responsive reader
- berita terpopuler dan newsletter
- metadata SEO serta mobile-first layout

## Menjalankan aplikasi

```bash
npm ci
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser. Untuk menguji
mode production secara lokal, cukup jalankan command berikut. Build production
akan dibuat otomatis sebelum server menyala:

```bash
npm start
```

## Deployment Vercel

Repository ini menggunakan Next.js native tanpa Vinext, Wrangler, Cloudflare
Worker, atau Docker. Hubungkan repository ke Vercel dan gunakan pengaturan
bawaan berikut:

- Framework Preset: `Next.js`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: kosongkan (otomatis dari Next.js)
- Node.js Version: `22.x`

Setiap push ke branch `main` akan menjadi production deployment jika Git
Integration Vercel sudah aktif.

## Quality gate

```bash
npm run lint
npm test
```
