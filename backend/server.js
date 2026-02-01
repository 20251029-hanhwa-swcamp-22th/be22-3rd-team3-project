const jsonServer = require('json-server');
const auth = require('json-server-auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const express = require('express');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Enable CORS
server.use(cors());

// Serve static files from uploads directory
server.use('/uploads', express.static(uploadsDir));

// Use default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename
    });
});

// Add custom route for multiple file uploads
server.post('/upload-multiple', upload.array('images', 64), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    const urls = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename
    }));
    res.json({ files: urls });
});

// Custom route for worldcup game start - get random candidates
server.get('/worldcups/:id/start/:count', (req, res) => {
    const db = router.db;
    const worldcupId = parseInt(req.params.id);
    const count = parseInt(req.params.count);

    const candidates = db.get('worldcup_candidates')
        .filter({ worldcupId: worldcupId })
        .value();

    // Shuffle and get random candidates
    const shuffled = candidates.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    res.json(selected);
});

// Custom route for quiz game start - get all questions
server.get('/quizzes/:id/start', (req, res) => {
    const db = router.db;
    const quizId = parseInt(req.params.id);

    const questions = db.get('quiz_questions')
        .filter({ quizId: quizId })
        .orderBy('questionNumber')
        .value();

    res.json(questions);
});

// Custom route for rankings
server.get('/worldcups/:id/ranking', (req, res) => {
    const db = router.db;
    const worldcupId = parseInt(req.params.id);

    const candidates = db.get('worldcup_candidates')
        .filter({ worldcupId: worldcupId })
        .orderBy('winCount', 'desc')
        .value();

    res.json(candidates);
});

server.get('/quizzes/:id/ranking', (req, res) => {
    const db = router.db;
    const quizId = parseInt(req.params.id);

    const results = db.get('quiz_results')
        .filter({ quizId: quizId })
        .orderBy(['score', 'completedAt'], ['desc', 'asc'])
        .take(10)
        .value();

    res.json(results);
});

// Bind the router db to the app
server.db = router.db;

// Add authentication
server.use(auth);

// Use default router
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
});
