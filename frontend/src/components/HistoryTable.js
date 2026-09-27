import React from "react";

function formatPrice(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryTable({ items, loading }) {
  return (
    <section className="history">
      <div className="history-header">
        <h2>Recent estimates</h2>
        <span className="history-count">{items.length} shown</span>
      </div>

      {loading && <p className="hint">Loading history…</p>}

      {!loading && items.length === 0 && (
        <p className="hint">No predictions yet — your first estimate will appear here.</p>
      )}

      {!loading && items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Year</th>
                <th>Motor</th>
                <th>Mileage</th>
                <th>Color</th>
                <th>Type</th>
                <th>Condition</th>
                <th>Price</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{row.model}</td>
                  <td>{row.year}</td>
                  <td>{row.motor_type}</td>
                  <td>{Math.round(row.running_km).toLocaleString()} km</td>
                  <td>{row.color}</td>
                  <td>{row.type}</td>
                  <td>{row.status}</td>
                  <td className="price-cell">{formatPrice(row.predicted_price)}</td>
                  <td>{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
