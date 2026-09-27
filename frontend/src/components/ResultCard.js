import React from "react";

function formatPrice(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ResultCard({ result, error, loading }) {
  return (
    <div className="result-card">
      <span className="result-label">Estimated price</span>

      {loading && <div className="result-value dim">Calculating…</div>}

      {!loading && error && <div className="result-error">{error}</div>}

      {!loading && !error && result && (
        <>
          <div className="result-value">{formatPrice(result.predicted_price)}</div>
          <dl className="result-meta">
            <div>
              <dt>Model</dt>
              <dd>{result.model}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{result.year}</dd>
            </div>
            <div>
              <dt>Mileage</dt>
              <dd>{Math.round(result.running_km).toLocaleString()} km</dd>
            </div>
            <div>
              <dt>Engine</dt>
              <dd>{result.motor_volume} L · {result.motor_type}</dd>
            </div>
          </dl>
        </>
      )}

      {!loading && !error && !result && (
        <div className="result-value dim">Fill in the form to get an estimate</div>
      )}
    </div>
  );
}
