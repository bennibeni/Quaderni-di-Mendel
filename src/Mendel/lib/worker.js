// Esegue l'esperimento fuori dal thread della pagina, così l'interfaccia resta reattiva.
import { run } from "./experiment.js";

self.onmessage = (event) => {
  try {
    const result = run(event.data, (msg) =>
      self.postMessage({ type: "progress", msg }),
    );
    self.postMessage({ type: "done", result });
  } catch (err) {
    self.postMessage({ type: "error", message: err.message || String(err) });
  }
};
