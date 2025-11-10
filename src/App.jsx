// App.jsx FINAL lengkap + kolom Perihal Surat Keluar
// Anda tinggal copy–paste ke Vercel / GitHub

import { useEffect, useRef, useState } from "react";

function App() {
  const [surat, setSurat] = useState([
    {
      id: 1,
      nomor: "",
      jenis: "",
      pengirim: "",
      perihal: "",
      tanggal: "",
      file: null,
    },
    {
      id: 2,
      nomor: "",
      jenis: "",
      pengirim: "",
      perihal: "",
      tanggal: "",
      file: null,
    },
  ]);

  const [form, setForm] = useState({
    nomor: "",
    jenis: "Surat Masuk",
    pengirim: "",
    perihal: "",
    tanggal: "",
    file: null,
  });

  // Fungsi ekspor CSV
  function exportToCSV(headers, rows, filename = "data_surat.csv") {
    const esc = (v) => (v == null ? "" : String(v)).replace(/"/g, '""');
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) =>
            h === "file"
              ? `"${esc(r[h] ? r[h].name : "")}"`
              : `"${esc(r[h])}"`
          )
          .join(",")
      ),
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

    if (
      !form.nomor ||
      !form.pengirim ||
      !form.perihal ||
      !form.tanggal ||
      !form.file
    ) {
      alert("Mohon lengkapi semua field dan unggah file PDF.");
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
      file: null,
    });

    // Reset input file
    document.getElementById("fileInput").value = "";
  };

  const handleExport = () => {
    const headers = [
      "id",
      "nomor",
      "jenis",
      "pengirim",
      "perihal",
      "tanggal",
      "file",
    ];
    exportToCSV(headers, surat, "data_surat.csv");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan.");
      e.target.value = "";
      return;
    }
    setForm({ ...form, file });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>📁 Administrasi Persuratan</h1>

      {/* FORM INPUT SURAT */}
      <form
        onSubmit={handleAdd}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "2rem",
          maxWidth: "800px",
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
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          required
        />

        <button
          type="submit"
          style={{
            gridColumn: "1 / span 2",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            padding: "10px",
          }}
        >
          Tambah Surat
        </button>
      </form>

      {/* TABEL DATA SURAT */}
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
            <th>File PDF</th>
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
              <td>
                {s.file ? (
                  <a
                    href={URL.createObjectURL(s.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat PDF
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOMBOL EKSPOR */}
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
