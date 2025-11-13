import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import MainPage from "./pages/shikshalokam-mitra/MainPage";
import ImprovementPlan from "./pages/improvement-plan";


function ProtectedRoute({ element }) {
  const isAuthenticated = true;
  return isAuthenticated ? element : <Navigate to={process.env.REACT_APP_ROUTE_LOGIN} />;
}

function App() {
  const routes = [
    { path: process.env.REACT_APP_ROUTE_MITRA_CHAT, element: <ProtectedRoute element={<MainPage />} /> },
    { path: process.env.REACT_APP_ROUTE_IMPROVEMENT_PLAN, element: <ProtectedRoute element={<ImprovementPlan />} /> },
  ];

  return useRoutes(routes);
}

export default App;
