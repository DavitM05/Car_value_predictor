# Carvalue — Car Price Predictor

Full-stack app that collects car specs from a React UI, sends them through a
FastAPI backend that proxies to an **external ML model server**, stores every
prediction in MySQL, and shows a history of past estimates.

```
React (frontend) → FastAPI (backend) → External ML model server
                          ↓
                        MySQL
```

## Project structure

```
car-price-predictor/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py          # FastAPI app, /predict and /history endpoints
│   ├── database.py      # SQLAlchemy engine/session, wait-for-db helper
│   ├── models.py        # Prediction ORM model
│   └── schemas.py       # Pydantic request/response schemas + enums
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── public/index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── App.css
│       ├── constants.js
│       └── components/
│           ├── PredictionForm.js
│           ├── ResultCard.js
│           └── HistoryTable.js
└── mock_model_server/
    └── app.py            # Optional stand-in for the external ML API, for local testing
```

## 1. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set `MODEL_SERVER_URL` to your real external model endpoint
(it must accept a POST with a JSON body and return a JSON field named one of
`predicted_price`, `price`, `prediction`, or `result`).

If you don't have a real model server handy, you can run the included mock
one locally (see "Testing without a real model server" below) and point
`MODEL_SERVER_URL` at it.

## 2. Run everything

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend docs (Swagger UI): http://localhost:8000/docs
- MySQL: localhost:3306

The backend waits for MySQL's healthcheck before starting, and also retries
its own connection on startup, so `docker-compose up` works from a cold
start without manual intervention.

## API

### `POST /predict`

Request body:

```json
{
  "model": "Toyota",
  "year": 2019,
  "motor_type": "Petrol",
  "running": 45000,
  "running_unit": "Km",
  "color": "White",
  "type": "Sedan",
  "status": "Good",
  "motor_volume": 2.0
}
```

- If `running_unit` is `"Miles"`, the backend converts the value to
  kilometers (`× 1.60934`) before calling the model server and before
  storing it.
- All categorical values are lower-cased before being sent to the external
  model server (e.g. `"Toyota"` → `"toyota"`), while the UI and database
  keep the human-readable, capitalized form.
- The predicted price and the full converted input are saved to MySQL, and
  the saved row (matching `PredictionResponse`) is returned to the client.

### `GET /history?limit=20`

Returns the most recent predictions:

```json
{
  "items": [ { "id": 1, "model": "Toyota", ... } ],
  "count": 42
}
```

## Database schema

Table `predictions`:

| column           | type      | notes                          |
|------------------|-----------|---------------------------------|
| id               | INT PK    | autoincrement                  |
| model            | VARCHAR   |                                 |
| year             | INT       |                                 |
| motor_type       | VARCHAR   |                                 |
| running_km       | FLOAT     | always stored in kilometers    |
| color            | VARCHAR   |                                 |
| type             | VARCHAR   | body style                     |
| status           | VARCHAR   | car condition                  |
| motor_volume     | FLOAT     |                                 |
| predicted_price  | FLOAT     |                                 |
| created_at       | DATETIME  | server default `now()`         |

Tables are created automatically on backend startup via
`Base.metadata.create_all`.

## Testing without a real model server

A tiny mock model server is included in `mock_model_server/` for local
development. It is **not** part of the docker-compose stack (since a real
deployment already has an external model server running elsewhere), but you
can run it alongside the stack:

```bash
cd mock_model_server
pip install fastapi uvicorn
uvicorn app:app --host 0.0.0.0 --port 9000
```

Then, in `.env`, set:

```
MODEL_SERVER_URL=http://host.docker.internal:9000/predict
```

(On Linux, use your host's Docker bridge IP instead of
`host.docker.internal`, or run the mock server in the same
`car_price_net` Docker network.)

## Notes

- CORS origins are configurable via `CORS_ORIGINS` (comma-separated) and
  default to `http://localhost:3000`.
- The frontend reads the backend URL from the build-time/runtime env var
  `REACT_APP_API_URL` (defaults to `http://localhost:8000`).
- If the external model server is unreachable or returns an error, `/predict`
  responds with `502`/`503` and a descriptive message instead of silently
  failing — the row is only written to MySQL after a valid price is received.
# Car_value_predictor
