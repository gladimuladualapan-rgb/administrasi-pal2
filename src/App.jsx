// App.jsx FINAL lengkap + kolom Perihal Surat Keluar
// Anda tinggal copy–paste ke Vercel / GitHub

import { useEffect, useRef, useState } from "react";

const BULAN_ROMAWI = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const KODE_JENIS = ["SK","SKJ","SB","PLT","MDT","KPTS","Lainnya"];
const KET_SURAT = ["Tersampaikan","Tidak tersampaikan","Reshuffle"];

function pad3(n){ return String(n).padStart(3,'0'); }

function useLocalStorage(key, initial){
  const [value,setValue] = useState(()=>{
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    }catch{ return initial }
  });
  useEffect(()=>{ localStorage.setItem(key, JSON.stringify(value)); },[key,value]);
  return [value,setValue];
}

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows){
  if(!rows || !rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => (v == null ? "" : String(v)).replace(/"/g, '""');
  const lines = [ headers.join(","), ...rows.map(r => headers.map(h => `"${esc(r[h])}"`).join(",")) ];
  return lines.join("
");
}

export default function App(){
  const [tab, setTab] = useState('keluar');
  const now = new Date();
  const defaultYear = now.getFullYear();

  const [keluar, setKeluar] = useLocalStorage('surat_keluar', []);
  const [masuk, setMasuk]   = useLocalStorage('surat_masuk', []);
  const [nomorCounter, setNomorCounter] = useLocalStorage('nomor_counter', 1);

  // ✅ Tambahkan perihal pada state awal
  const [sk, setSk] = useState({
    nomor: pad3(nomorCounter),
    kodeTujuan: "",
    kodeJenis: "",
    kodeJenisLain: "",
    pal: "P.A.L",
    bulan: BULAN_ROMAWI[now.getMonth()],
    tahun: defaultYear,
    tujuan: "",
    perihal: "",               // ✅ baru
    keterangan: KET_SURAT[0],
    pdfFile: null,
    pdfName: "",
    pdfData: null
  });

  useEffect(()=>{ setSk(s=>({...s, nomor: pad3(nomorCounter)})); },[nomorCounter]);

  function validateKeluar(f){
    const errs = [];
    if(!/^[0-9]{3}$/.test(f.nomor)) errs.push("Nomor harus 3 digit.");
    if(!(f.kodeTujuan==='6' || f.kodeTujuan==='9')) errs.push("Kode Tujuan hanya 6 atau 9.");
    if(!f.kodeJenis) errs.push("Kode Jenis wajib.");
    if(f.kodeJenis==='Lainnya' && !f.kodeJenisLain.trim()) errs.push("Isi jenis surat lainnya.");
    if(!BULAN_ROMAWI.includes(f.bulan)) errs.push("Bulan tidak valid.");
    if(!/^[0-9]{4}$/.test(String(f.tahun))) errs.push("Tahun harus 4 digit.");
    if(!f.tujuan.trim()) errs.push("Tujuan wajib.");
    if(!f.perihal.trim()) errs.push("Perihal wajib.");      // ✅ baru
    if(!KET_SURAT.includes(f.keterangan)) errs.push("Keterangan tidak valid.");
    if(!f.pdfFile) errs.push("File PDF wajib.");
    if(f.pdfFile && f.pdfFile.type !== "application/pdf") errs.push("File harus PDF.");
    return errs;
  }

  function submitKeluar(e){
    e.preventDefault();
    const errs = validateKeluar(sk);
    if(errs.length){ alert("Periksa input:
- " + errs.join("
- ")); return; }

    const reader = new FileReader();
    reader.onload = () => {
      const data = {
        nomor: sk.nomor,
        kodeTujuan: sk.kodeTujuan,
        kodeJenis: sk.kodeJenis==='Lainnya' ? sk.kodeJenisLain : sk.kodeJenis,
        pal: sk.pal,
        bulan: sk.bulan,
        tahun: sk.tahun,
        tujuan: sk.tujuan,
        perihal: sk.perihal,          // ✅ baru
        keterangan: sk.keterangan,
        pdfName: sk.pdfName,
        pdfData: reader.result,
        dibuat: new Date().toISOString()
      };

      setKeluar(prev => [...prev, data]);
      setNomorCounter(c => c+1);
      setSk(s=>({ ...s, nomor: pad3(nomorCounter+1), tujuan:"", perihal:"", pdfFile:null, pdfName:"", pdfData:null }));
    };

    reader.readAsDataURL(sk.pdfFile);
  }

  // ================= SURAT MASUK ==================
  const [sm, setSm] = useState({ nomorSurat:"", perihal:"", asal:"", foto:null, fotoName:"" });
  const fotoRef = useRef();

  function submitMasuk(e){
    e.preventDefault();
    const errs = [];
    if(!sm.nomorSurat.trim()) errs.push("Nomor Surat wajib.");
    if(!sm.perihal.trim()) errs.push("Perihal wajib.");
    if(!sm.asal.trim()) errs.push("Asal wajib.");

    const file = sm.foto;
    if(!file) errs.push("Foto wajib.");
    else{
      if(file.type !== 'image/jpeg') errs.push("Hanya JPG.");
      if(file.size > 5*1024*1024) errs.push("Max 5MB.");
    }

    if(errs.length){ alert("Periksa input:
- "+errs.join("
- ")); return; }

    const reader = new FileReader();
    reader.onload = () => {
      const data = {
        nomorSurat: sm.nomorSurat,
        perihal: sm.perihal,
        asal: sm.asal,
        fotoName: sm.fotoName,
        fotoDataUrl: reader.result,
        diterima: new Date().toISOString()
      };

      setMasuk(prev=>[...prev,data]);
      setSm({ nomorSurat:"", perihal:"", asal:"", foto:null, fotoName:"" });
      if(fotoRef.current) fotoRef.current.value=null;
    };
    reader.readAsDataURL(file);
  }

  function exportKeluarCSV(){ downloadBlob(new Blob([toCSV(keluar)], {type:'text/csv'}), `surat-keluar-${Date.now()}.csv`); }
  function exportKeluarJSON(){ downloadBlob(new Blob([JSON.stringify(keluar,null,2)],{type:'application/json'}), `surat-keluar-${Date.now()}.json`); }

  return (
    <div className="container">

      {/* TOP RIGHT HEADER */}
      <div style={{ position:"absolute", top:10, right:10, opacity:0.7 }}>
        <small>Administrasi Persuratan</small>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='keluar'?'active':''}`} onClick={()=>setTab('keluar')}>Surat Keluar</button>
        <button className={`tab ${tab==='masuk'?'active':''}`} onClick={()=>setTab('masuk')}>Surat Masuk</button>
      </div>

      {/* ================== SURAT KELUAR ================== */}
      {tab==='keluar' && (
        <div className="card">
          <h2>Form Surat Keluar</h2>

          <form onSubmit={submitKeluar} className="row">

            <div className="field h3">
