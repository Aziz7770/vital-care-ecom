import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { captureMetaTestCode } from "./lib/metaTestCode";
import { ensureMetaClickIds } from "./lib/capi";

captureMetaTestCode();
// Save the Facebook ad-click ID from the landing address before any page change removes it.
ensureMetaClickIds();

createRoot(document.getElementById("root")!).render(<App />);
