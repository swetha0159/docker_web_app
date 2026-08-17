'use strict';

const express = require('express');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const app = express();

// Main application route
app.get('/', (req, res) => {
    res.send('Hello World from NodeJS App on EKS!');
});

// Kubernetes liveness probe
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Kubernetes readiness probe
app.get('/ready', (req, res) => {
    res.status(200).send('Ready');
});

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
