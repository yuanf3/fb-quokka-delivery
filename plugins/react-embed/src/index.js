import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";

const targetElement = document.getElementById("react-app-embed");

if (targetElement) {
  const propsFromPlugin = JSON.parse(targetElement.getAttribute("properties"));
  ReactDOM.render(
    <React.StrictMode>
      <App propsFromPlugin={propsFromPlugin} />
    </React.StrictMode>,
    targetElement
  );
}
