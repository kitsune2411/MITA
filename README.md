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
