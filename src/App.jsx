import { useEffect, useMemo, useRef, useState } from "react";

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
  a.href = url; 
  a.download = filename; 
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ FIX — Tidak ada karakter \" yang bermasalah
function toCSV(rows){
  if(!rows || !rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => (v == null ? "" : String(v)).replace(/"/g, '""');
  const lines = [
    headers.join(","),
    ...rows.map(r => headers.map(h => `"${esc(r[h])}"`).join(","))
  ];
  return lines.join("\n");
}

export default function App(){
  const [tab, setTab] = useState('keluar');
  const now = new Date();
  const defaultYear = now.getFullYear();
  const [keluar, setKeluar] = useLocalStorage('surat_keluar', []);
  const [masuk, setMasuk]   = useLocalStorage('surat_masuk', []);
  const [nomorCounter, setNomorCounter] = useLocalStorage('nomor_counter', 1);

  const [sk, setSk] = useState({
    nomor: pad3(nomorCounter),
    kodeTujuan: "",
    kodeJenis: "",
    kodeJenisLain: "",
    pal: "P.A.L",
    bulan: BULAN_ROMAWI[now.getMonth()],
    tahun: defaultYear,
    tujuan: "",
    keterangan: KET_SURAT[0]
  });

  useEffect(()=>{ setSk(s=>({...s, nomor: pad3(nomorCounter)})); },[nomorCounter]);

  function validateKeluar(f){
    const errs = [];
    if(!/^\d{3}$/.test(f.nomor)) errs.push("Nomor harus 3 digit (contoh 001).");
    if(!(f.kodeTujuan==='6' || f.kodeTujuan==='9')) errs.push("Kode Tujuan hanya 6 atau 9.");
    if(!f.kodeJenis) errs.push("Kode Jenis Surat wajib diisi.");
    if(f.kodeJenis==='Lainnya' && !f.kodeJenisLain.trim()) errs.push("Isi kode jenis surat lainnya.");
    if(!BULAN_ROMAWI.includes(f.bulan)) errs.push("Bulan harus I s.d. XII.");
    if(!/^\d{4}$/.test(String(f.tahun))) errs.push("Tahun harus 4 digit.");
    if(!f.tujuan.trim()) errs.push("Tujuan surat wajib diisi.");
    if(!KET_SURAT.includes(f.keterangan)) errs.push("Keterangan tidak valid.");
    return errs;
  }

  function submitKeluar(e){
    e.preventDefault();
    const errs = validateKeluar(sk);
    if(errs.length){ alert("Periksa input:\n- " + errs.join("\n- ")); return; }
    const data = {
      nomor: sk.nomor,
      kodeTujuan: sk.kodeTujuan,
      kodeJenis: sk.kodeJenis==='Lainnya' ? sk.kodeJenisLain : sk.kodeJenis,
      pal: sk.pal,
      bulan: sk.bulan,
      tahun: sk.tahun,
      tujuan: sk.tujuan,
      keterangan: sk.keterangan,
      dibuat: new Date().toISOString()
    };
    setKeluar(prev => [...prev, data]);
    setNomorCounter(c => c+1);
    setSk(s=>({ ...s, nomor: pad3(nomorCounter+1), tujuan: "" }));
  }

  const [sm, setSm] = useState({
    nomorSurat: "",
    perihal: "",
    asal: "",
    foto: null,
    fotoName: ""
  });

  const fotoRef = useRef();

  function submitMasuk(e){
    e.preventDefault();
    const errs = [];
    if(!sm.nomorSurat.trim()) errs.push("Nomor Surat wajib diisi.");
    if(!sm.perihal.trim()) errs.push("Perihal Surat wajib diisi.");
    if(!sm.asal.trim()) errs.push("Asal Instansi wajib diisi.");

    const file = sm.foto;
    if(!file){ errs.push("Foto JPG wajib diunggah."); }
    else {
      if(file.type !== 'image/jpeg'){ errs.push("Hanya format JPG diperbolehkan."); }
      if(file.size > 5*1024*1024){ errs.push("Ukuran maksimum 5 MB."); }
    }
    if(errs.length){ alert("Periksa input:\n- " + errs.join("\n- ")); return; }

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
      setMasuk(prev => [...prev, data]);
      setSm({ nomorSurat:"", perihal:"", asal:"", foto:null, fotoName:"" });
      if(fotoRef.current) fotoRef.current.value = null;
    };
    reader.readAsDataURL(file);
  }

  function exportKeluarCSV(){
    const csv = toCSV(keluar);
    downloadBlob(new Blob([csv], {type:'text/csv'}), `surat-keluar-${Date.now()}.csv`);
  }
  function exportKeluarJSON(){
    downloadBlob(new Blob([JSON.stringify(keluar,null,2)],{type:'application/json'}), `surat-keluar-${Date.now()}.json`);
  }
  function exportMasukCSV(){
    const strip = masuk.map(m => ({ 
      nomorSurat:m.nomorSurat, 
      perihal:m.perihal, 
      asal:m.asal, 
      fotoName:m.fotoName, 
      diterima:m.diterima 
    }));
    const csv = toCSV(strip);
    downloadBlob(new Blob([csv], {type:'text/csv'}), `surat-masuk-${Date.now()}.csv`);
  }
  function exportMasukJSON(){
    downloadBlob(new Blob([JSON.stringify(masuk,null,2)],{type:'application/json'}), `surat-masuk-${Date.now()}.json`);
  }

  function clearAll(){
    if(confirm('Hapus semua data lokal (localStorage)?')){
      setKeluar([]); setMasuk([]); setNomorCounter(1);
    }
  }

  return (
    <div className="container">
      <h1 style={{marginBottom:8}}>Administrasi Persuratan</h1>
      <p className="helper">Data disimpan di localStorage. Siap deploy ke Vercel.</p>

      <div className="tabs">
        <button className={`tab ${tab==='keluar'?'active':''}`} onClick={()=>setTab('keluar')}>Surat Keluar</button>
        <button className={`tab ${tab==='masuk'?'active':''}`} onClick={()=>setTab('masuk')}>Surat Masuk</button>
        <div style={{flex:1}}></div>
        <button className="ghost" onClick={clearAll}>Hapus Semua</button>
      </div>

      {tab==='keluar' && (
        <div className="card">
          <h2>Form Surat Keluar</h2>
          <form onSubmit={submitKeluar} className="row" style={{marginTop:12}}>
            <div className="field h3">
              <label>Nomor (3 digit mulai 001)</label>
              <input value={sk.nomor} onChange={e=>setSk({...sk, nomor:e.target.value})} />
            </div>

            <div className="field h3">
              <label>Kode Tujuan Surat</label>
              <select value={sk.kodeTujuan} onChange={e=>setSk({...sk, kodeTujuan:e.target.value})}>
                <option value="">-- pilih --</option>
                <option value="6">6</option>
                <option value="9">9</option>
              </select>
            </div>

            <div className="field h3">
              <label>Kode Jenis Surat</label>
              <select value={sk.kodeJenis} onChange={e=>setSk({...sk, kodeJenis:e.target.value})}>
                <option value="">-- pilih --</option>
                {KODE_JENIS.map(k=> <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {sk.kodeJenis==='Lainnya' && (
              <div className="field h6">
                <label>Isi Kode Jenis (lainnya)</label>
                <input value={sk.kodeJenisLain} onChange={e=>setSk({...sk, kodeJenisLain:e.target.value})} />
              </div>
            )}

            <div className="field h3">
              <label>P.A.L</label>
              <input value={sk.pal} onChange={e=>setSk({...sk, pal:e.target.value})} />
            </div>

            <div className="field h3">
              <label>Romawi Bulan</label>
              <select value={sk.bulan} onChange={e=>setSk({...sk, bulan:e.target.value})}>
                {BULAN_ROMAWI.map(b=> <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="field h3">
              <label>Tahun</label>
              <input type="number" value={sk.tahun} onChange={e=>setSk({...sk, tahun:e.target.value})} />
            </div>

            <div className="field h6">
              <label>Tujuan Surat</label>
              <input value={sk.tujuan} onChange={e=>setSk({...sk, tujuan:e.target.value})} />
            </div>

            <div className="field h6">
              <label>Keterangan Surat</label>
              <select value={sk.keterangan} onChange={e=>setSk({...sk, keterangan:e.target.value})}>
                {KET_SURAT.map(k=> <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div className="field">
              <button type="submit">Simpan</button>
            </div>
          </form>

          <h3>Data Surat Keluar</h3>

          <button className="ghost" onClick={exportKeluarCSV}>Export CSV</button>
          <button className="ghost" onClick={exportKeluarJSON}>Export JSON</button>

          <table className="table">
            <thead>
              <tr>
                <th>Nomor</th><th>Kode Tujuan</th><th>Kode Jenis</th><th>P.A.L</th><th>Bulan</th><th>Tahun</th><th>Tujuan</th><th>Keterangan</th><th>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {keluar.map((r,i)=>(
                <tr key={i}>
                  <td>{r.nomor}</td><td>{r.kodeTujuan}</td><td>{r.kodeJenis}</td><td>{r.pal}</td><td>{r.bulan}</td><td>{r.tahun}</td><td>{r.tujuan}</td><td>{r.keterangan}</td>
                  <td>{new Date(r.dibuat).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='masuk' && (
        <div className="card">
          <h2>Form Surat Masuk</h2>
          <form onSubmit={submitMasuk} className="row" style={{marginTop:12}}>
            <div className="field h4">
              <label>Nomor Surat</label>
              <input value={sm.nomorSurat} onChange={e=>setSm({...sm, nomorSurat:e.target.value})} />
            </div>
            <div className="field h4">
              <label>Perihal Surat</label>
              <input value={sm.perihal} onChange={e=>setSm({...sm, perihal:e.target.value})} />
            </div>
            <div className="field h4">
              <label>Asal Instansi</label>
              <input value={sm.asal} onChange={e=>setSm({...sm, asal:e.target.value})} />
            </div>
            <div className="field h6">
              <label>Foto (JPG maks 5MB)</label>
              <input 
                ref={fotoRef} 
                type="file" 
                accept="image/jpeg"
                onChange={e=>{
                  const f = e.target.files?.[0];
                  setSm({...sm, foto:f || null, fotoName:f?f.name:""});
                }}
              />
            </div>
            <div className="field">
              <button type="submit">Simpan</button>
            </div>
          </form>

          <h3>Data Surat Masuk</h3>
          <button className="ghost" onClick={exportMasukCSV}>Export CSV</button>
          <button className="ghost" onClick={exportMasukJSON}>Export JSON</button>

          <table className="table">
            <thead>
              <tr>
                <th>Nomor Surat</th><th>Perihal</th><th>Asal</th><th>Foto</th><th>Diterima</th>
              </tr>
            </thead>
            <tbody>
              {masuk.map((m,i)=>(
                <tr key={i}>
                  <td>{m.nomorSurat}</td>
                  <td>{m.perihal}</td>
                  <td>{m.asal}</td>
                  <td>{m.fotoName ? <a href={m.fotoDataUrl} target="_blank">{m.fotoName}</a> : "-"}</td>
                  <td>{new Date(m.diterima).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
