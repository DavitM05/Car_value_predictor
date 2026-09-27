import React, { useCallback, useEffect, useState } from "react";
import PredictionForm from "./components/PredictionForm";
import ResultCard from "./components/ResultCard";
import HistoryTable from "./components/HistoryTable";
import { API_URL } from "./constants";

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/history?limit=20`);
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setHistory(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (formValues) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Could not get a prediction. Please try again.");
      }

      const data = await res.json();
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Carvalue</span>
        </div>
        <p className="tagline">
          Enter a car's specs and get an instant market price estimate.
        </p>
      </header>

      <main className="main-grid">
        <PredictionForm onSubmit={handleSubmit} loading={loading} />
        <ResultCard result={result} error={error} loading={loading} />
      </main>

      <HistoryTable items={history} loading={historyLoading} />

      <footer className="app-footer">
        <span>Prices are model-generated estimates, not guaranteed valuations.</span>
      </footer>
    </div>
  );
}
