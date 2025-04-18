const express = require('express');
const dotenv = require('dotenv');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const queryRoutes = require('./routes/queryRoutes');
const helmet = require('helmet');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Middleware for security

// Middleware for handling CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Middleware for handling errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Routes for managing knowledge and queries
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/query', queryRoutes);
// Health check route
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
// Not found route
app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
