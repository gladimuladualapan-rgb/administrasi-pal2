<table className="table">
  <thead>
    <tr>
      <th>Nomor Surat</th>
      <th>Perihal</th>
      <th>Asal</th>
      <th>Foto</th>
      <th>Diterima</th>
    </tr>
  </thead>
  <tbody>
    {masuk.map((m,i)=>(
      <tr key={i}>
        <td>{m.nomorSurat}</td>
        <td>{m.perihal}</td>
        <td>{m.asal}</td>
        <td>{m.fotoName ? <a href={m.fotoDataUrl} target="_blank" rel="noreferrer">{m.fotoName}</a> : "-"}</td>
        <td>{new Date(m.diterima).toLocaleString()}</td>
      </tr>
    ))}
  </tbody>
</table>