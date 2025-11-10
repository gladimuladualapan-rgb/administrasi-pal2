// App.jsx FINAL lengkap + kolom Perihal Surat Keluar
// Anda tinggal copy–paste ke Vercel / GitHub

import { useEffect, useRef, useState } from "react";

function App() {
  const [surat, setSurat] = useState([
    {
      id: 1,
      nomor: "001/SM/XI/2025",
      jenis: "Surat Masuk",
      pengirim: "Dinas Pendidikan Kota",
      perihal: "Undangan Rapat Koordinasi",
      tanggal: "2025-11-10",
    },
    {
      id: 2,
      nomor: "002/SK/XI/2025",
      jenis: "Surat Keluar",
      pengirim: "Bagian Umum",
      perihal: "Laporan Kegiatan Bulanan",
      tanggal: "2025-11-09",
    },
  ]);

  const [form, setForm] = useState({
    nomor: "",
    jenis: "Surat Masuk",
    pengirim: "",
    perihal: "",
    tanggal: "",
  });

  // Fungsi ekspor CSV
  function exportToCSV(headers, rows, filename = "data_surat.csv") {
    const esc = (v) => (v == null ? "" : String(v)).replace(/"/g, '""');
    const lines = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${esc(r[h])}"`).join(",")),
    ];
    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.nomor || !form.pengirim || !form.perihal || !form.tanggal) {
      alert("Mohon lengkapi semua field.");
      return;
    }
    const newSurat = {
      id: surat.length + 1,
      ...form,
    };
    setSurat([...surat, newSurat]);
    setForm({
      nomor: "",
      jenis: "Surat Masuk",
      pengirim: "",
      perihal: "",
      tanggal: "",
    });
  };

  const handleExport = () => {
    const headers = ["id", "nomor", "jenis", "pengirim", "perihal", "tanggal"];
    exportToCSV(headers, surat, "data_surat.csv");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>📁 Administrasi Persuratan</h1>

      <form
        onSubmit={handleAdd}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "2rem",
          maxWidth: "700px",
        }}
      >
        <input
          type="text"
          placeholder="Nomor Surat"
          value={form.nomor}
          onChange={(e) => setForm({ ...form, nomor: e.target.value })}
          required
        />
        <select
          value={form.jenis}
          onChange={(e) => setForm({ ...form, jenis: e.target.value })}
        >
          <option>Surat Masuk</option>
          <option>Surat Keluar</option>
        </select>
        <input
          type="text"
          placeholder="Pengirim / Penerima"
          value={form.pengirim}
          onChange={(e) => setForm({ ...form, pengirim: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Perihal"
          value={form.perihal}
          onChange={(e) => setForm({ ...form, perihal: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.tanggal}
          onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
          required
        />
        <button
          type="submit"
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Tambah Surat
        </button>
      </form>

      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          maxWidth: "900px",
          marginBottom: "1rem",
        }}
      >
        <thead style={{ background: "#f5f5f5" }}>
          <tr>
            <th>ID</th>
            <th>Nomor</th>
            <th>Jenis</th>
            <th>Pengirim / Penerima</th>
            <th>Perihal</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {surat.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.nomor}</td>
              <td>{s.jenis}</td>
              <td>{s.pengirim}</td>
              <td>{s.perihal}</td>
              <td>{s.tanggal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleExport}
        style={{
          padding: "10px 20px",
          background: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Export ke CSV
      </button>
    </div>
  );
}

export default App;
