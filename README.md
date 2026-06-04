# FinSight

FinSight adalah purwarupa Asisten Keuangan Pintar terintegrasi untuk ekosistem Bank DBS. Sistem ini bekerja secara end-to-end melalui tiga pilar: Zero-Click Tracking (pelabelan otomatis) , Smart Profiling (pemetaan persona nasabah melalui clustering) , dan Proactive AI Coach. Inovasi utama sistem ini terletak pada penggunaan arsitektur Deep Learning sebagai pendeteksi anomali (anomaly detection) aliran kas. Ketika jaringan saraf tiruan mendeteksi pembelanjaan yang tidak wajar, data anomali tersebut langsung menjadi trigger terotomasi yang memanggil Generative AI untuk meracik teguran, pujian, atau saran dengan gaya komunikasi spesifik sesuai persona finansial nasabah.

## ⚙️ Model Domain & Core Engine Layer

Repository ini berisi Backend dari **[FinSight]**. Backend FinSight dibuat menggunakan **Node.js**, **NestJS Framework**, **TypeScript**, dan **PostgreSQL (melalui TypeORM)**, backend ini menerapkan arsitektur modular yang dirancang untuk menerjemahkan logika ledger yang rumit menjadi API yang andal dan ramah bagi aplikasi client.

---

## 🗺️ Ikhtisar Sistem & Domain Bisnis

Backend **[FinSight]** bertindak sebagai satu-satunya sumber kebenaran (*single source of truth*) untuk seluruh catatan dana nasabah dan riwayat profil perilaku keuangan. Sistem ini memproses transaksi secara real-time, menghitung rasio *Needs vs. Wants* secara langsung, menerjemahkan deskripsi transaksi menjadi label kategori pengeluaran, serta menganalisis tingkat risiko anomali transaksi.

---

## 🔄 Model Domain Bisnis & Alur Kerja Utama

Sistem mengoordinasikan transaksi dan analitik melalui alur kerja tertutup antara **NestJS Core Engine**, **PostgreSQL Database**, dan **FastAPI Machine Learning Service**.

```text
  [Aplikasi Seluler Client]
          │
          ▼  1. Eksekusi Transaksi (POST /transactions)
  ┌────────────────────────────────────────────────────────┐
  │                 [NestJS API Gateway]                   │
  │                                                        │
  │  2. Simpan Transaksi & Mutasi Saldo Buku Besar         │
  │     (Tulis ke PostgreSQL db: tabel transaksi & rekening)───► [PostgreSQL]
  │                                                        │
  │  3. Klasifikasi Kategori & Analisis Fraud               │
  │     (HTTP Post ke FastAPI ML Endpoint)                 │
  └───────────────────┬────────────────────────────────────┘
                      │
                      ▼  4. Klasifikasi & Analisis Risiko
  ┌────────────────────────────────────────────────────────┐
  │               [FastAPI Machine Learning]               │
  │                                                        │
  │  * Kategorisasi otomatis teks mutasi (Wants/Needs)     │
  │  * Skor risiko anomali untuk pendeteksian fraud        │
  └───────────────────┬────────────────────────────────────┘
                      │
                      ▼  5. Label Kategori & Status Anomali
  ┌────────────────────────────────────────────────────────┐
  │                 [NestJS API Gateway]                   │
  │                                                        │
  │  6. Kalkulasi Ulang Rasio Pengeluaran Nasabah          │
  │  7. Simpan statistik terbaru ke db (tabel nasabah)     ───► [PostgreSQL]
  │  8. (Opsional) Kirim notifikasi alarm anomali          ───► [Perangkat Client]
  └────────────────────────────────────────────────────────┘
```

---

## 🔌 Integrasi Komersial Pihak Ketiga

Untuk mendukung kelancaran operasional keuangan, pengiriman notifikasi, dan pengelolaan dokumen, core engine ini terintegrasi dengan layanan eksternal berikut:

| Penyedia Layanan | Cakupan Fungsi | Tujuan Bisnis |
| :--- | :--- | :--- |
| **Payment Gateway** <br>*(misal: Stripe / Xendit)* | Rekonsiliasi Dana | Menangani pengisian saldo (*deposit*), penarikan dana (*payout*), dan pencatatan mutasi penyelesaian transaksi secara real-time. |
| **Notification Gateway** <br>*(misal: Twilio / FCM)* | Keamanan Identitas | Mengirimkan kode OTP SMS secara instan, verifikasi keamanan login, dan siaran darurat notifikasi anomali transaksi. |
| **Secure Object Storage** <br>*(misal: AWS S3)* | Arsip Dokumen | Menyimpan file laporan kesehatan keuangan mingguan dan bulanan nasabah (dalam format PDF/JSON) secara aman dan terenkripsi. |
| **Transactional Email** <br>*(misal: SendGrid)* | Hubungan Nasabah | Mengirimkan bukti transfer, tagihan bulanan, serta ringkasan dokumen analitik keuangan langsung ke surel nasabah. |

---

## 🛡️ Tata Kelola Data & Kepatuhan (Compliance)

Menangani sektor keuangan pribadi menuntut standar keamanan data yang tinggi. Sistem backend ini mengimplementasikan prinsip kepatuhan berikut:

1. **Enkripsi Data Sensitif (PII Protection)**:
   * Password pengguna dienkripsi menggunakan algoritma **BCrypt** sebelum disimpan di database.
   * Verifikasi keamanan sekunder diterapkan pada field sensitif seperti *nama_ibu_kandung* untuk menghindari pencurian identitas.
2. **Rotasi Sesi JWT & Refresh Token**:
   * Menerapkan rotasi token sesi ganda (Access & Refresh token) yang aman.
   * Masa berlaku token dibatasi (contoh: `7d`) untuk meminimalkan risiko pembajakan akun.
3. **Immutable Ledger Design**:
   * Data mutasi pada tabel `transaksi` bersifat hanya bisa ditambah (*append-only*). Data transaksi yang sudah tercatat tidak dapat diubah (*update*) atau dihapus (*delete*).
   * Perubahan saldo rekening selalu disandingkan dengan log mutasi debet/kredit yang jelas untuk menjamin auditabilitas ledger keuangan.

---

## 📊 Kapabilitas API Utama

Setiap modul API dikelompokkan berdasarkan kapabilitas bisnis yang disediakannya untuk pengguna:

### 1. Identity & Access Management (IAM)
*   **Endpoint**: `/auth/register`, `/auth/login`, `/auth/refresh`, `/users/me`
*   **Nilai Bisnis**: Menangani pendaftaran nasabah baru, otentikasi login, hashing password, dan pelacakan segmen demografis serta gaji bulanan (`gaji_bulanan`).

### 2. Rekening & Buku Besar Saldo (Ledger Registry)
*   **Endpoint**: `/accounts`
*   **Nilai Bisnis**: Mengelola detail akun tabungan nasabah (`rekening`), mencatat saldo saat ini (`saldo`), dan status operasional akun (Aktif, Tangguh).

### 3. Pemrosesan & Klasifikasi Transaksi
*   **Endpoint**: `/transactions`, `/transactions/transfer`
*   **Nilai Bisnis**: Memproses transfer dana antar rekening nasabah. Melakukan pemetaan Merchant Category Code (MCC) secara otomatis dan mengarahkan teks transaksi ke ML NLP FastAPI jika data kode merchant tidak tersedia.

### 4. Scheduler & Laporan Keuangan Berbasis AI
*   **Endpoint**: `/reports/insights`
*   **Nilai Bisnis**: Mengelola pemicu otomatis (*cron jobs*) yang berjalan berkala:
    *   **Tugas 7 Harian (Mingguan)**: Mengumpulkan data transaksi 7 hari terakhir, meminta skor anomali ke FastAPI, membuat file PDF laporan mingguan, dan mengirim notifikasi ringkasan.
    *   **Tugas 30 Harian (Bulanan)**: Menjalankan algoritma pengelompokan perilaku nasabah (*clustering*), memperbarui persona demografis, dan menyusun laporan bulanan berbasis LLM.
    *   **Monthly Reset Job**: Mengosongkan akumulator pengeluaran Needs/Wants menjadi nol setiap tanggal 1 pukul 00:00.

---

## 📈 Keandalan Sistem & Pemantauan

Untuk menjaga target waktu aktif (*uptime*) sistem sebesar `99.9%`:

*   **Observability Stack**: Integrasi dengan **Sentry** dan **Datadog** untuk pelacakan error serta analisis latensi query database TypeORM secara real-time.
*   **Scheduler Health Monitor**: Stakeholder produk dapat mengakses endpoint `/scheduler/status` untuk memantau status eksekusi terakhir, jadwal eksekusi berikutnya, dan kesehatan cron jobs mingguan/bulanan.
*   **HTTP Resilience & Fallback**: Integrasi API eksternal menuju FastAPI dibungkus dengan konfigurasi retry otomatis, batas waktu tunggu (*timeout*) 3 detik, dan sistem *fallback* nilai default guna mencegah backend hang saat layanan AI mengalami kendala.

---

## 🚀 Panduan Cepat untuk Tim Produk & QA

Panduan ini memudahkan tim non-teknis dalam menjalankan backend secara lokal untuk melakukan pengujian fungsionalitas atau melihat dokumentasi API interaktif.

### Langkah Memulai (Setup Lokal)

1. **Klon Repositori dan Pasang Dependensi**:
   ```bash
   git clone [BACKEND_REPO_URL]
   cd NEST-JS
   npm install
   ```

2. **Konfigurasi Variabel Lingkungan Lokal**:
   Salin file konfigurasi awal:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan masukkan konfigurasi database PostgreSQL lokal Anda:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=[PASSWORD_POSTGRES_ANDA]
   DB_DATABASE=finsight_db
   JWT_SECRET=[KODE_RAHASIA_JWT_ANDA]
   ```

3. **Inisialisasi Skema & Data Uji**:
   Jalankan migrasi skema tabel dan masukkan data nasabah buatan untuk pengujian:
   ```bash
   # Buat skema tabel di PostgreSQL
   npm run migration:run
   
   # Suntikkan data awal (nasabah, rekening, riwayat transaksi dummy)
   npm run seed
   ```

4. **Jalankan Server Lokal**:
   ```bash
   npm run start:dev
   ```

5. **Akses Dashboard API Swagger (OpenAPI UI)**:
   Buka browser Anda dan akses alamat:
   ```text
   http://localhost:3000/api/docs
   ```
   Melalui halaman ini, Product Manager dan QA Engineer dapat mencoba memicu panggilan API secara langsung (seperti login nasabah, melihat saldo, atau mencoba alur transfer dana).
