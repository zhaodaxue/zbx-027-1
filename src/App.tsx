import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import BatchDetail from "@/pages/BatchDetail";
import Production from "@/pages/Production";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/batches/:id" element={<BatchDetail />} />
          <Route path="/production" element={<Production />} />
        </Route>
      </Routes>
    </Router>
  );
}
