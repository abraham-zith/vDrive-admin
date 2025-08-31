import "./App.css";
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

const Users = lazy(() => import("./pages/Users"));

function App() {
  return (
    <div className="w-dvw h-dvh flex flex-col relative">
      <Navbar />
      <div className="w-full h-full flex-grow overflow-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<div>Coming soon</div>} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
