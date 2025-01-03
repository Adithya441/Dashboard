import React from "react";
import { Routes, Route } from "react-router-dom";
import Hello from "./Layout";
import LoginPage from "./Components/authentication/Login";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Hello />} />
    </Routes>
  );
};

export default App;
