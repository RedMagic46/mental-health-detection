# MindCare

MindCare adalah platform web yang dirancang khusus untuk membantu deteksi dini kondisi kesehatan mental secara mandiri dan menghubungkan pengguna dengan bantuan profesional. 

Project ini dibangun menggunakan stack **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, dan **Supabase** sebagai database backend.

---

## Kenapa MindCare?

Masalah kesehatan mental seringkali telat dideteksi karena stigma atau akses yang sulit. Di sini, kami membuat platform di mana siapa saja bisa melakukan tes skrining kesehatan mental secara cepat, melacak suasana hati harian, dan berkonsultasi langsung dengan psikolog/konselor lewat chat room yang aman.

---

## Fitur Utama

### 1. Skrining DASS-21 berbasis Machine Learning
Alih-alih menggunakan kalkulasi skor manual yang kaku, platform ini mengintegrasikan **Machine Learning Inference** langsung di sisi server. Penilaian DASS-21 (Depression, Anxiety, and Stress Scale) menggunakan bobot model terlatih (`dass21_weights.json`) untuk memprediksi tingkat keparahan dengan hasil klasifikasi: **Normal**, **At Risk (Berisiko)**, atau **Critical (Kritis)**.

### 2. Sistem Multi-Role (RBAC) yang Aman
Akses dibagi menjadi 3 level demi menjaga kerahasiaan data pasien:
*   **User (Pasien)**: Mengisi tes DASS-21, mencatat mood harian, ikut berdiskusi di forum, dan melakukan chat konsultasi secara privat.
*   **Consultant (Psikolog/Konselor)**: Punya panel sendiri untuk membalas chat pasien yang ditugaskan ke dirinya, melihat grafik mood pasien (7-30 hari ke belakang), dan menulis catatan evaluasi internal (tidak terlihat oleh pasien).
*   **Admin**: Mengelola semua data user, menugaskan konsultan ke tiket obrolan, mengedit daftar pertanyaan kuesioner DASS-21, serta melakukan moderasi konten (FAQ, Cerita Sukses, dan Forum).

### 3. Spanduk Darurat (Crisis Banner)
Jika hasil tes DASS-21 terakhir pengguna tergolong **Kritis (Critical)**, platform akan otomatis menampilkan spanduk merah darurat di bagian atas halaman. Di sini disediakan nomor bantuan tanggap darurat yang valid:
*   **Hotline Kesehatan Jiwa (SEJIWA)**: Hubungi `119` lalu tekan `8`.
*   **Halo Kemenkes**: Hubungi `1500-567`.

### 4. Forum Diskusi & FAQ
*   Wadah bagi pengguna untuk saling berbagi cerita atau keluh kesah secara anonim atau terbuka.
*   Admin dapat mengelola konten edukasi kesehatan mental (FAQ) dan kisah sukses perjuangan kesehatan mental pasien.

### 5. Notifikasi Email Otomatis (Nodemailer)
Sistem otomatis mengirim email secara asinkron ketika:
*   Ada tiket konsultasi baru yang masuk (notifikasi ke Admin).
*   Ada balasan chat baru dari konselor (notifikasi ke Pasien).

---

## Tech Stack & Library

*   **Framework**: Next.js 16 (App Router) & React 19
*   **Styling**: Tailwind CSS
*   **Database**: Supabase (PostgreSQL)
*   **State Management**: Zustand
*   **Autentikasi**: JWT + bcryptjs
*   **E-mail**: Nodemailer
*   **Grafik**: Recharts

---