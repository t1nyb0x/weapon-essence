import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { IndexedDbImageStorage } from "./adapters/indexeddb/IndexedDbImageStorage";

const imageStorage = new IndexedDbImageStorage();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("ルート要素が見つかりません");
}

createRoot(rootElement).render(
  <StrictMode>
    <App imageStorage={imageStorage} />
  </StrictMode>,
);
