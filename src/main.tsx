import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/styles.css";
import { BrowserRouter } from "react-router";

import AppRouter from "./app/router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>,
);
