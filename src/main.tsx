import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import AppRouter from "./app/router.tsx";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>
);
