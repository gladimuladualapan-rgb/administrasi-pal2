import { useEffect, useRef, useState } from "react";

const BULAN_ROMAWI = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const KODE_JENIS = ["SK","SKJ","SB","PLT","MDT","KPTS","Lainnya"];
const KET_SURAT = ["Tersampaikan","Tidak tersampaikan","Reshuffle"];

function pad3(n){ 
  return String(n).padStart(3,'0'); 
}

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
    keterangan: KET_SURAT[0],
    pdfFile: null,
    pdfName: "",
    pdfData: null
  });

  useEffect(()=>{
    setSk(s=>({...s, nomor: pad3(nomorCounter)}));
  },[nomorCounter]);

  function validateKeluar(f){
    const errs = [];
    if(!/^[0-9]{3}$/.test(f.nomor)) errs.push("Nomor harus 3 digit.");
    if(!(f.kodeTujuan==='6' || f.kodeTujuan==='9')) errs.push("Kode Tujuan hanya 6 atau 9.");
    if(!f.kodeJenis) errs.push("Kode Jenis wajib.");
    if(f.kodeJenis==='Lainnya' && !f.kodeJenisLain.trim()) errs.push("Isi jenis surat lainnya.");
    if(!BULAN_ROMAWI.includes(f.bulan)) errs.push("Bulan tidak valid.");
    if(!/^[0-9]{4}$/.test(String(f.tahun))) errs.push("Tahun harus 4 digit.");
    if(!f.tujuan.trim()) errs.push("Tujuan wajib.");
    if(!KET_SURAT.includes(f.keterangan)) errs.push("Keterangan tidak valid.");
    if(!f.pdfFile) errs.push("File PDF wajib.");
    if(f.pdfFile && f.pdfFile.type !== "application/pdf") errs.push("File harus PDF.");
    return errs;
  }

  function submitKeluar(e){
    e.preventDefault();
    const errs = validateKeluar(sk);
    if(errs.length){ 
      alert("Periksa input:\n- " + errs.join("\n- ")); 
      return; 
    }

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
        keterangan: sk.keterangan,
        pdfName: sk.pdfName,
        pdfData: reader.result,
        dibuat: new Date().toISOString()
      };

      setKeluar(prev => [...prev, data]);
      setNomorCounter(c => c+1);
      setSk(s=>({ 
        ...s, nomor: pad3(nomorCounter+1), tujuan:"", pdfFile:null, pdfName:"", pdfData:null 
      }));
    };

    reader.readAsDataURL(sk.pdfFile);
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
    if(!sm.nomorSurat.trim()) errs.push("Nomor Surat wajib.");
    if(!sm.perihal.trim()) errs.push("Perihal wajib.");
    if(!sm.asal.trim()) errs.push("Asal wajib.");

    const file = sm.foto;
    if(!file) errs.push("Foto wajib.");
    else{
      if(file.type !== 'image/jpeg') errs.push("Hanya JPG.");
      if(file.size > 5*1024*1024) errs.push("Max 5MB.");
    }

    if(errs.length){ 
      alert("Periksa input:\n- "+errs.join("\n- ")); 
      return; 
    }

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

  function exportKeluarCSV(){
    const csv = toCSV(keluar);
    downloadBlob(new Blob([csv], {type:'text/csv'}), `surat-keluar-${Date.now()}.csv`);
  }

  function exportKeluarJSON(){
    downloadBlob(new Blob([JSON.stringify(keluar,null,2)],{type:'application/json'}), `surat-keluar-${Date.now()}.json`);
  }

  return (
    <div className="container">

      {/* TOP RIGHT TEXT */}
      <div style={{ position:"absolute", top:10, right:10, opacity:0.7 }}>
        <small>Administrasi Persuratan</small>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='keluar'?'active':''}`} onClick={()=>setTab('keluar')}>
          Surat Keluar
        </button>
        <button className={`tab ${tab==='masuk'?'active':''}`} onClick={()=>setTab('masuk')}>
          Surat Masuk
        </button>
      </div>

      {/* SURAT KELUAR */}
      {tab==='keluar' && (
        <div className="card">
          <h2>Form Surat Keluar</h2>

          <form onSubmit={submitKeluar} className="row">

            <div className="field h3">
              <label>Nomor (001)</label>
              <input 
                value={sk.nomor} 
                onChange={e=>setSk({...sk, nomor:e.target.value})} 
              />
            </div>

            <div className="field h3">
              <label>Kode Tujuan (6/9)</label>
              <select 
                value={sk.kodeTujuan} 
                onChange={e=>setSk({...sk, kodeTujuan:e.target.value})}
              >
                <option value="">--</option>
                <option value="6">6</option>
                <option value="9">9</option>
              </select>
            </div>

            <div className="field h3">
              <label>Kode Jenis</label>
              <select 
                value={sk.kodeJenis} 
                onChange={e=>setSk({...sk, kodeJenis:e.target.value})}
              >
                <option value="">--</option>
                {KODE_JENIS.map(k=> <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {sk.kodeJenis==="Lainnya" && (
              <div className="field h6">
                <label>Jenis Surat Lainnya</label>
                <input 
                  value={sk.kodeJenisLain} 
                  onChange={e=>setSk({...sk, kodeJenisLain:e.target.value})} 
                />
              </div>
            )}

            <div className="field h4">
              <label>P.A.L</label>
              <input value={sk.pal} readOnly />
            </div>

            <div className="field h4">
              <label>Bulan (Romawi)</label>
              <select 
                value={sk.bulan} 
                onChange={e=>setSk({...sk, bulan:e.target.value})}
              >
                {BULAN_ROMAWI.map(b=> <option key={b}>{b}</option>)}
              </select>
            </div>

            <div className="field h4">
              <label>Tahun</label>
              <input 
                value={sk.tahun} 
                onChange={e=>setSk({...sk, tahun:e.target.value})} 
              />
            </div>

            <div className="field h6">
              <label>Tujuan Surat</label>
              <input 
                value={sk.tujuan} 
                onChange={e=>setSk({...sk, tujuan:e.target.value})} 
              />
            </div>

            <div className="field h6">
              <label>Keterangan</label>
              <select 
                value={sk.keterangan} 
                onChange={e=>setSk({...sk, keterangan:e.target.value})}
              >
                {KET_SURAT.map(k=> <option key={k}>{k}</option>)}
              </select>
            </div>

            <div className="field h6">
              <label>Upload File Surat (PDF)</label>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={e=>{
                  const f = e.target.files?.[0];
                  setSk({...sk, pdfFile:f, pdfName: f ? f.name : ""});
                }}
              />
            </div>

            <button className="primary">Simpan</button>

          </form>

          <hr />

          <h3>Daftar Surat Keluar</h3>

          <button onClick={exportKeluarCSV}>Export CSV</button>
          <button onClick={exportKeluarJSON} style={{marginLeft:8}}>Export JSON</button>

          <table className="table">
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Kode Tujuan</th>
                <th>Kode Jenis</th>
                <th>P.A.L</th>
                <th>Bulan</th>
                <th>Tahun</th>
                <th>Tujuan</th>
                <th>Keterangan</th>
                <th>File PDF</th>
              </tr>
            </thead>
            <tbody>
              {keluar.map((r,i)=>(
                <tr key={i}>
                  <td>{r.nomor}</td>
                  <td>{r.kodeTujuan}</td>
                  <td>{r.kodeJenis}</td>
                  <td>{r.pal}</td>
                  <td>{r.bulan}</td>
                  <td>{r.tahun}</td>
                  <td>{r.tujuan}</td>
                  <td>{r.keterangan}</td>
                  <td>
                    {r.pdfName ? (
                      <a href={r.pdfData} target="_blank" rel="noopener noreferrer">
                        {r.pdfName}
                      </a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* SURAT MASUK */}
      {tab==='masuk' && (
        <div className="card">
          <h2>Form Surat Masuk</h2>

          <form onSubmit={submitMasuk} className="row">

            <div className="field h4">
              <label>Nomor Surat</label>
              <input 
                value={sm.nomorSurat} 
                onChange={e=>setSm({...sm, nomorSurat:e.target.value})} 
              />
            </div>

            <div className="field h4">
              <label>Perihal</label>
              <input 
                value={sm.perihal} 
                onChange={e=>setSm({...sm, perihal:e.target.value})} 
              />
            </div>

            <div className="field h4">
              <label>Asal Instansi</label>
              <input 
                value={sm.asal} 
                onChange={e=>setSm({...sm, asal:e.target.value})} 
              />
            </div>

            <div className="field h6">
              <label>Foto (JPG maks 5mb)</label>
              <input 
                type="file" 
                accept="image/jpeg"
                ref={fotoRef}
                onChange={e=>{
                  const f = e.target.files?.[0];
                  setSm({...sm, foto:f, fotoName: f ? f.name : ""});
                }}
              />
            </div>

            <button className="primary">Simpan</button>

          </form>

          <hr />

          <h3>Daftar Surat Masuk</h3>

          <table className="table">
            <thead>
              <tr>
                <th>Nomor Surat</th>
                <th>Perihal</th>
                <th>Asal</th>
                <th>Foto</th>
              </tr>
            </thead>
            <tbody>
              {masuk.map((r,i)=>(
                <tr key={i}>
                  <td>{r.nomorSurat}</td>
                  <td>{r.perihal}</td>
                  <td>{r.asal}</td>
                  <td>
                    {r.fotoName ? (
                      <a href={r.fotoDataUrl} target="_blank">
                        {r.fotoName}
                      </a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}
