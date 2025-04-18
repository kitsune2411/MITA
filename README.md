start database

```
docker compose up -d
```

connect to db

```
docker exec -it mita_pg psql -U postgres -d mita
```

sql

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

-- Optionally, create an index for faster vector similarity searches
CREATE INDEX ON knowledge_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

```
