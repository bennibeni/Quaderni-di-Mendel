// Formattazione italiana deterministica. Non si usa toLocaleString perché Node e i browser
// raggruppano diversamente le migliaia («2000» contro «2.000») e la pagina darebbe errori di idratazione.
export const int = (v) =>
  String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const dec = (v, d = 2) => {
  const [a, b] = Math.abs(v).toFixed(d).split(".");
  return (
    (v < 0 && Number(Math.abs(v).toFixed(d)) !== 0 ? "−" : "") +
    int(Number(a)) +
    (b ? "," + b : "")
  );
};
export const pct = (v, d = 0) => `${dec(v * 100, d)}%`;
