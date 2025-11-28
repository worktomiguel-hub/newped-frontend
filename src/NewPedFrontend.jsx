import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function NewPedFrontend() {
  // steps: 0 = splash, 1 = company, 2 = configs, 3 = upload
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState("loreal");

  const [metaTotal, setMetaTotal] = useState(29058.27);
  const [limitePedidos, setLimitePedidos] = useState(20);
  const [numeroNotaInicial, setNumeroNotaInicial] = useState(165610);
  const [produtosPrioritarios, setProdutosPrioritarios] = useState(
    "8903,8091,8093,8949,2726,8899"
  );

  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState({});
  const [message, setMessage] = useState("");

  const next = () => {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else if (step === 2) {
      if (!metaTotal || !limitePedidos || !numeroNotaInicial) {
        setMessage("Preencha todos os campos antes de continuar.");
        return;
      }
      setMessage("");
      setStep(3);
    }
  };

  const back = () => setStep(step - 1);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setMessage("Lendo arquivo...");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      const previews = {};
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (json.length > 0) {
          const header = json[0].map((h) => (h ? String(h).trim() : ""));
          const rows = json.slice(1, 8).map((r) => {
            const obj = {};
            for (let i = 0; i < header.length; i++) {
              obj[header[i] || `col_${i}`] = r[i];
            }
            return obj;
          });

          previews[sheetName] = { header, rows };
        }
      });

      setPreview(previews);
      setMessage("Preview carregado.");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao ler arquivo.");
    }
  };

  const handleProcess = async () => {
    if (!fileName) {
      setMessage("Envie um arquivo antes.");
      return;
    }

    setMessage("Processando...");

    const file = document.getElementById("excel-file").files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("company", company);
    fd.append("meta_total", metaTotal);
    fd.append("limite_pedidos", limitePedidos);
    fd.append("numero_nota_inicial", numeroNotaInicial);
    fd.append("produtos_prioritarios", produtosPrioritarios);
    fd.append("file", file);

    const api = import.meta.env.VITE_API_URL;

    try {
      const res = await fetch(api, { method: "POST", body: fd });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${company}_pedidos.zip`;
      a.click();

      setMessage("Processamento concluído! Download iniciado.");
    } catch (err) {
      setMessage("ERRO: " + err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f0f0f0, #ffffff)",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: "32px", marginBottom: "20px" }}>
          NewPed
        </h1>

        {message && (
          <div
            style={{
              background: "#eef",
              borderLeft: "4px solid #66f",
              padding: "10px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        {/* PASSO 0 */}
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ marginBottom: "20px" }}>
              Gere pedidos completos com base em metas e planilhas Excel.
            </p>
            <button
              onClick={next}
              style={{
                padding: "10px 20px",
                background: "#4a68d8",
                color: "white",
                border: 0,
                borderRadius: "8px",
              }}
            >
              Iniciar
            </button>
          </div>
        )}

        {/* PASSO 1 */}
        {step === 1 && (
          <>
            <h3>Escolha a empresa</h3>

            <label style={{ display: "block", marginBottom: "10px" }}>
              <input
                type="radio"
                checked={company === "loreal"}
                onChange={() => setCompany("loreal")}
              />{" "}
              Lorea'l
            </label>

            <label style={{ display: "block", marginBottom: "10px" }}>
              <input
                type="radio"
                checked={company === "flora"}
                onChange={() => setCompany("flora")}
              />{" "}
              Flora
            </label>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button onClick={back}>Voltar</button>
              <button
                onClick={next}
                style={{ background: "#4a68d8", color: "white", padding: "8px 16px" }}
              >
                Próximo
              </button>
            </div>
          </>
        )}

        {/* PASSO 2 */}
        {step === 2 && (
          <>
            <h3>Configurações</h3>

            <div style={{ marginBottom: "10px" }}>
              <label>META TOTAL:</label>
              <input
                type="number"
                step="0.01"
                value={metaTotal}
                onChange={(e) => setMetaTotal(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>LIMITE DE PEDIDOS:</label>
              <input
                type="number"
                value={limitePedidos}
                onChange={(e) => setLimitePedidos(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>NÚMERO DA NOTA:</label>
              <input
                type="number"
                value={numeroNotaInicial}
                onChange={(e) => setNumeroNotaInicial(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>PRODUTOS PRIORITÁRIOS (separados por vírgula):</label>
              <input
                type="text"
                value={produtosPrioritarios}
                onChange={(e) => setProdutosPrioritarios(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button onClick={back}>Voltar</button>
              <button
                onClick={next}
                style={{ background: "#4a68d8", color: "white", padding: "8px 16px" }}
              >
                Próximo
              </button>
            </div>
          </>
        )}

        {/* PASSO 3 */}
        {step === 3 && (
          <>
            <h3>Upload do Excel</h3>

            <input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              style={{ marginBottom: "15px" }}
            />

            {/* PREVIEW */}
            <div style={{ maxHeight: "200px", overflow: "auto", marginBottom: "10px" }}>
              {Object.keys(preview).map((sheet) => (
                <div
                  key={sheet}
                  style={{
                    marginBottom: "12px",
                    border: "1px solid #ddd",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <strong>{sheet}</strong>
                  <table style={{ fontSize: "12px", marginTop: "5px", width: "100%" }}>
                    <thead>
                      <tr>
                        {preview[sheet].header.map((h, i) => (
                          <th key={i} style={{ textAlign: "left" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview[sheet].rows.map((row, r) => (
                        <tr key={r}>
                          {preview[sheet].header.map((h, c) => (
                            <td key={c}>{String(row[h] || "").slice(0, 30)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <button
              onClick={handleProcess}
              style={{
                marginTop: "10px",
                background: "green",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
              }}
            >
              Processar
            </button>

            <button onClick={back} style={{ marginLeft: "10px" }}>
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
