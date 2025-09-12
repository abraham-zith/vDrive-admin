import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AppContent from "./AppContent";

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
