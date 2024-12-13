import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import MainPage from "./pages/Shikshalokam Mitra/MainPage";
import { FRONTEND_ROUTES } from "./routes/routes";


function ProtectedRoute({ element }) {
  // const isAuthenticated = !!localStorage.getItem("accToken");
  const isAuthenticated = true;
  return isAuthenticated ? element : <Navigate to={FRONTEND_ROUTES.LOGIN} />;
}

function App() {
  const routes = [
    { path: FRONTEND_ROUTES.MITRA_CHAT, element: <ProtectedRoute element={<MainPage />} /> },
  ];

  return useRoutes(routes);
}

export default App;
