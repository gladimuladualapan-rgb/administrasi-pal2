# Administrasi Persuratan (React + Vite)

Aplikasi web sederhana untuk administrasi **Surat Keluar** dan **Surat Masuk**. Data tersimpan di `localStorage` dan siap dideploy ke **Vercel**.

## Fitur
- Form *Surat Keluar* sesuai struktur yang Anda minta (Nomor 3 digit mulai 001, Kode Tujuan 6/9, Kode Jenis SK/SKJ/SB/PLT/MDT/KPTS/+Lainnya, P.A.L, Bulan Romawi I–XII, Tahun, Tujuan, Keterangan Tersampaikan/Tidak tersampaikan/Reshuffle).
- Form *Surat Masuk* (Nomor Surat, Perihal, Asal Instansi, Foto JPG maks 5MB).
- Tabel rekap untuk masing-masing form.
- **Export CSV & JSON** untuk Surat Keluar dan Surat Masuk.
- Penyimpanan lokal (localStorage).

## Pengembangan Lokal
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy ke Vercel
1. Push folder proyek ini ke repository GitHub/GitLab/Bitbucket.
2. Buka vercel.com → New Project → Import repo.
3. Framework preset: **Vite** (Auto terdeteksi).
4. Build Command: `vite build` — Output: `dist` — Install Command: `npm i` (default).
5. Deploy.

## Catatan
- Ekspor CSV/JSON dilakukan dari data di tabel (Surat Keluar/Masuk).
- Foto surat masuk disimpan sebagai DataURL di localStorage hanya untuk pratinjau/ekspor JSON.
