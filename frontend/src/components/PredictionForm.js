import React, { useState } from "react";
import {
  MODELS,
  MOTOR_TYPES,
  MILEAGE_UNITS,
  COLORS,
  BODY_TYPES,
  STATUSES,
} from "../constants";

const currentYear = new Date().getFullYear();

const initialState = {
  model: MODELS[0],
  year: currentYear - 5,
  motor_type: MOTOR_TYPES[0],
  running: "",
  running_unit: "Km",
  color: COLORS[0],
  type: BODY_TYPES[0],
  status: STATUSES[0],
  motor_volume: "",
};

function Field({ label, htmlFor, children }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function PredictionForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialState);

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      year: Number(form.year),
      running: Number(form.running),
      motor_volume: Number(form.motor_volume),
    });
  };

  return (
    <form className="predict-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <Field label="Model" htmlFor="model">
          <select id="model" value={form.model} onChange={update("model")}>
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year" htmlFor="year">
          <input
            id="year"
            type="number"
            min="1950"
            max={currentYear + 1}
            value={form.year}
            onChange={update("year")}
            required
          />
        </Field>

        <Field label="Motor type" htmlFor="motor_type">
          <select
            id="motor_type"
            value={form.motor_type}
            onChange={update("motor_type")}
          >
            {MOTOR_TYPES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Motor volume (L)" htmlFor="motor_volume">
          <input
            id="motor_volume"
            type="number"
            step="0.1"
            min="0.1"
            max="20"
            placeholder="e.g. 2.0"
            value={form.motor_volume}
            onChange={update("motor_volume")}
            required
          />
        </Field>

        <Field label="Mileage" htmlFor="running">
          <div className="mileage-row">
            <input
              id="running"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 85000"
              value={form.running}
              onChange={update("running")}
              required
            />
            <div className="unit-toggle" role="group" aria-label="Mileage unit">
              {MILEAGE_UNITS.map((unit) => (
                <button
                  type="button"
                  key={unit}
                  className={form.running_unit === unit ? "unit active" : "unit"}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, running_unit: unit }))
                  }
                  aria-pressed={form.running_unit === unit}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          {form.running_unit === "Miles" && form.running !== "" && (
            <p className="hint">
              Converts to {(Number(form.running) * 1.60934).toFixed(1)} km before
              sending to the model
            </p>
          )}
        </Field>

        <Field label="Color" htmlFor="color">
          <select id="color" value={form.color} onChange={update("color")}>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Body type" htmlFor="type">
          <select id="type" value={form.type} onChange={update("type")}>
            {BODY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Condition" htmlFor="status">
          <select id="status" value={form.status} onChange={update("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Estimating..." : "Estimate price"}
      </button>
    </form>
  );
}
