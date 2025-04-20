# MITA - Campus Assistant for STIKOM BALI

MITA (STIKOM BALI Intelligent Assistant) is a chatbot designed to help students of STIKOM BALI access important campus information in a fast and efficient manner. MITA leverages AI-powered embeddings to provide contextual answers to student queries about campus facilities, locations, academic information, and more.

The system uses OpenAI's embedding model to transform textual knowledge into mathematical vectors and compare them with a database of campus-related information. By doing so, MITA can provide accurate and relevant answers to students based on their questions.

### Features:

- **AI-Powered Chatbot**: Built on OpenAI's embedding API for natural language understanding.
- **Admin-Only Knowledge Input**: Only admins can add and manage knowledge via a simple interface.
- **Query Answering**: Students can ask questions about campus facilities, schedules, locations, and other campus-related topics.
- **PostgreSQL Backend**: Uses PostgreSQL to store and manage campus knowledge and embeddings.
- **Cost-Efficient**: Designed with a minimal viable product (MVP) approach to minimize operational costs while still providing an effective user experience.

### Tech Stack:

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **AI Integration**: OpenAI Embedding API
- **Environment**: Docker for containerization (optional)

### How It Works:

1. Admins input campus-related information (e.g., "The library is located on the 3rd floor of Building A").
2. MITA converts this information into a mathematical **embedding** (vector) using OpenAI's API and stores it in PostgreSQL.
3. Students can query MITA (e.g., "Where is the library?").
4. MITA generates an embedding of the student's question and compares it with the stored embeddings.
5. MITA retrieves the most relevant knowledge and responds with the answer.

---

### Prerequisites:

- Node.js v16 or later
- PostgreSQL database setup
- OpenAI API key for embeddings

---

### Installation

#### 1. **Start Database**

To start the database using Docker, run the following command:

```bash
docker compose up -d
```

#### 2. **Connect to Database**

To connect to the database, run:

```bash
docker exec -it mita_pg psql -U postgres -d mita
```

#### 3. **Create the Database Schema**

Run the following SQL commands to set up the necessary tables in PostgreSQL:

```sql
-- Enable the pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the necessary tables
CREATE TABLE knowledge (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_embeddings (
  id SERIAL PRIMARY KEY,
  knowledge_id INT REFERENCES knowledge(id) ON DELETE CASCADE,
  embedding VECTOR(1536) NOT NULL,  -- Storing 1536-dimensional embeddings
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
    user_id TEXT,         -- Optional: for authenticated users
    session_id TEXT,      -- Optional: for anonymous users/sessions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- add soft delete
ALTER TABLE knowledge
ADD COLUMN deleted_at TIMESTAMP;


-- Optionally, create an index for faster vector similarity searches
CREATE INDEX ON knowledge_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
SET ivfflat.probes = 10;  -- balance between speed and accuracy
```

---

### Run the Server

1. Clone the repository

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables (e.g., database connection, OpenAI API key).

4. Run the server:

   ```bash
   npm start
   ```

---

## Endpoints Overview

| Method | Endpoint             | Description                                     |
| ------ | -------------------- | ----------------------------------------------- |
| GET    | `/health`            | Health check for the server                     |
| GET    | `/api/knowledge/`    | Retrieve all active knowledge entries           |
| POST   | `/api/knowledge/add` | Add a new knowledge entry                       |
| DELETE | `/api/knowledge/:id` | Soft delete a knowledge entry                   |
| POST   | `/api/query`         | Submit a user query and get AI-generated answer |

---

## 1. Health Check

### `GET /health`

Performs a basic health check to ensure the server is operational.

#### Response

```json
OK
```

---

## 2. Knowledge Management

### `GET /api/knowledge/`

Retrieves all non-deleted knowledge entries stored in the system.

#### Response

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

---

### `POST /api/knowledge/add`

Adds a new piece of knowledge to the system. Automatically generates OpenAI Embedding and stores it alongside metadata.

#### Request Body

```json
{
  "title": "Library Location",
  "category": "Campus Info",
  "content": "The library is located on the 2rd floor of the main building in ITB STIKOM Bali Renon."
}
```

#### Response

```json
{
  "message": "Knowledge added successfully",
  "id": 1
}
```

---

### `DELETE /api/knowledge/:id`

Performs a soft delete by marking the record with a `deleted_at` timestamp.

#### Path Parameter

- `id`: Integer (ID of the knowledge entry to delete)

#### Example

```http
DELETE /api/knowledge/1
```

#### Response

```json
{
  "message": "Knowledge deleted successfully"
}
```

---

## 3. Query Engine

### `POST /api/query`

Submits a natural language question. The system will compute the embedding, compare it against stored knowledge using cosine similarity, and return the best-matched answer if the confidence is above a threshold.

#### Request Body

```json
{
  "query": "Where is the library?"
}
```

#### Successful Response (Confident)

```json
{
  "title": "Library Location",
  "content": "The library is located on the 2rd floor of the main building in ITB STIKOM Bali Renon.",
  "confidence": 0.91
}
```

#### Fallback Response (Not Confident)

```json
{
  "message": "No relevant information found. Try asking differently!"
}
```

#### Notes

- Confidence scores are calculated as `1 - cosine_distance`.
- If the score is below a defined threshold (e.g., 0.85), the system will return a fallback message.
- Top 3 matches are considered internally before selecting the best result.

---

## 4. Query Logging

Each request made to the `/api/query` endpoint is automatically logged for future analysis and system improvement.

### Logged Fields

- Query text
- Timestamp
- Confidence score
- Matched knowledge ID (if any)
- Response message
- User ID or IP address (automatically detected)

#### Purpose

- Identify recurring questions with low accuracy
- Improve training data
- Monitor usage patterns and abuse prevention
- Support user-specific analytics

---
