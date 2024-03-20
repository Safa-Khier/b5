import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./i18n.js"; // Import the i18n configuration
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./AuthContext.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <RecoilRoot>
        <AuthProvider>
          <App />
        </AuthProvider>
      </RecoilRoot>
    </Router>
  </React.StrictMode>,
);
