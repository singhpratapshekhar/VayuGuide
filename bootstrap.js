import React from "react";
import ReactDOM from "react-dom/client";
import VayuGuide from "./VayuGuide.esm.js";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(React.createElement(VayuGuide));
}
