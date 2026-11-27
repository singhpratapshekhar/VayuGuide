import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import VayuGuide from "./VayuGuide.jsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <VayuGuide />
    </React.StrictMode>
  );
}
