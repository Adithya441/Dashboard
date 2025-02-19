import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("username"); // Replace with your actual authentication logic

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
