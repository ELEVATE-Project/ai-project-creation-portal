import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import MainPage from "./pages/Shikshalokam Mitra/MainPage";


function ProtectedRoute({ element }) {
  // const isAuthenticated = !!localStorage.getItem("accToken");
  const isAuthenticated = true;
  return isAuthenticated ? element : <Navigate to={process.env.REACT_APP_ROUTE_LOGIN} />;
}

function App() {
  const routes = [
    { path: process.env.REACT_APP_ROUTE_MITRA_CHAT, element: <ProtectedRoute element={<MainPage />} /> },
  ];

  return useRoutes(routes);
}

export default App;
