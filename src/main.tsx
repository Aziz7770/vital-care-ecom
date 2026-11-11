import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { captureMetaTestCode } from "./lib/metaTestCode";

captureMetaTestCode();

createRoot(document.getElementById("root")!).render(<App />);
