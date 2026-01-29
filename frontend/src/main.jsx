import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ErrorBoundary } from "./components/common/ErrorBoundary.jsx";
import "./styles.css";
import "maplibre-gl/dist/maplibre-gl.css";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
