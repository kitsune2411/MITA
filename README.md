# MITA - Campus Assistant for STIKOM BALI

MITA (STIKOM BALI Intelligent Assistant) is a chatbot designed to help students of STIKOM BALI access important campus information in a fast and efficient manner. MITA leverages AI-powered embeddings to provide contextual answers to student queries about campus facilities, locations, academic information, and more.

The system uses OpenAI's embedding model to transform textual knowledge into mathematical vectors and compare them with a database of campus-related information. By doing so, MITA can provide accurate and relevant answers to students based on their questions.

---

## 🚀 Features

- **AI-Powered Chatbot**: Built on OpenAI's embedding API for natural language understanding.
- **Admin-Only Knowledge Input**: Only admins can add and manage knowledge via a simple interface.
- **Query Answering**: Students can ask questions about campus facilities, schedules, locations, and other campus-related topics.
- **PostgreSQL Backend**: Uses PostgreSQL with pgvector to store and manage embeddings.
- **Efficient & Cost-Friendly**: Designed as a minimal viable product (MVP) to minimize operational costs.

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL + pgvector
- **AI Integration**: OpenAI Embedding API
- **Containerization**: Docker (optional)

---

## ⚙️ How It Works

1. Admins add campus-related knowledge.
2. The system generates embeddings and stores them.
3. Students submit queries.
4. MITA compares embeddings and finds the most relevant match.
5. A contextual response is returned.

---

## 📦 Prerequisites

- Node.js v16 or later
- PostgreSQL with `pgvector` extension enabled
- OpenAI API Key

---

## 📥 Installation

### 1. Start the Database

```bash
docker compose up -d
```

### 2. Connect to PostgreSQL

```bash
docker exec -it mita_pg psql -U postgres -d mita
```

### 3. Create Schema

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE knowledge_embeddings (
  id SERIAL PRIMARY KEY,
  knowledge_id INT REFERENCES knowledge(id) ON DELETE CASCADE,
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE query_logs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  confidence_score REAL,
  is_fallback BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
SET ivfflat.probes = 10;
```

---

## 🚀 Run the Server

1. Clone this repo
2. Install dependencies:

```bash
npm install
```

3. Configure `.env`
4. Start the app:

```bash
npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint             | Description                           |
| ------ | -------------------- | ------------------------------------- |
| GET    | `/health`            | Health check                          |
| GET    | `/api/knowledge/`    | Retrieve all active knowledge entries |
| POST   | `/api/knowledge/add` | Add new knowledge                     |
| DELETE | `/api/knowledge/:id` | Soft delete a knowledge entry         |
| POST   | `/api/query`         | Submit a query and get AI response    |

---

## 📍 Endpoint Details

### 1. `GET /health`

Simple check if the server is running.

```json
"OK"
```

### 2. `GET /api/knowledge/`

Returns all non-deleted knowledge.

```json
[
  {
    "id": 1,
    "title": "Library Location",
    "category": "Campus Info",
    "content": "The library is located on the 2rd floor of the main building in ITB STIKOM Bali Renon.",
    "deleted_at": null
  }
]
```

### 3. `POST /api/knowledge/add`

Adds new knowledge and auto-generates embeddings.

```json
{
  "title": "Library Location",
  "category": "Campus Info",
  "content": "The library is located on the 2rd floor of the main building in ITB STIKOM Bali Renon."
}
```

Response:

```json
{
  "message": "Knowledge added successfully",
  "id": 1
}
```

### 4. `DELETE /api/knowledge/:id`

Soft deletes by updating `deleted_at`.

```http
DELETE /api/knowledge/1
```

Response:

```json
{
  "message": "Knowledge deleted successfully"
}
```

### 5. `POST /api/query`

Handles natural language questions.

```json
{
  "query": "Where is the library?"
}
```

Response:

```json
{
  "response": "The library is located on the 2rd floor of the main building in ITB STIKOM Bali Renon.",
  "confidence": 0.91
}
```

Cached Response:

```json
{
  "response": "The library is located on the 2rd floor of the main building in ITB STIKOM Bali Renon.",
  "confidence": 0.91,
  "fromCache": true
}
```

---

## 📝 Query Logging

Each `/api/query` call is logged with:

- Question & response
- Confidence score
- IP/User-Agent
- User/session ID (if available)

Helps improve accuracy, analytics, and prevent abuse.

---

## 🧰 Helper Script - `mita.sh`

You can use the `mita.sh` Bash script to manage your Docker services efficiently.

### 📜 Available Commands:

- `up`: Start all services in detached mode
- `down`: Stop and remove all services (with confirmation)
- `logs`: Show logs for the `app` service
- `build`: Build the containers
- `push`: Build and push the Docker image using `.env` variables
- `restart`: Restart the `app` service
- `psql`: Access PostgreSQL using credentials from `.env`
- `status`: Show status of all services
- `prune`: Remove unused Docker objects (with confirmation)
- `help`: Show command list

Usage:

```bash
./mita.sh [command]
```

This script makes it easier to interact with your Dockerized MITA stack in development and production.

---
