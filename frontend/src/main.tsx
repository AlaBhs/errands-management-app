import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/router";
import "./index.css";

const saved = localStorage.getItem("ey-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initial = saved === "dark" || saved === "light"
  ? saved
  : prefersDark ? "dark" : "light";
document.documentElement.classList.add(initial);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>
);