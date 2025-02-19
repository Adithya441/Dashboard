import React from "react";
import { Routes, Route } from "react-router-dom";
import Hello from "./Layout";
import LoginPage from "./Components/authentication/Login";
import PrivateRoute from "./Components/authentication/PrivateRoute";
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Hello />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
