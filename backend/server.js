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

const upload = multer({
  // 1. 저장 위치 및 파일명 설정 (앞서 정의한 storage 객체 사용)
  storage: storage,

  // 2. 업로드 제한 설정
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한

  // 3. 파일 필터링 로직 (허용되는 파일인지 확인)
  fileFilter: (req, file, cb) => {
    // 허용할 MIME 타입 목록
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    // 허용할 확장자 목록
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype

    // 조건 검사: MIME 타입과 확장자가 모두 목록에 포함되어 있는지 확인
    if(allowedTypes.includes(mimeType) && allowedExts.includes(ext)){
      cb(null, true)
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다 (jpg, png, gif, webp)'))
    }
  }
});

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

// 사용자 정보 관련 API (마이페이지)

// 1. 내 정보 조회 API
server.get('/users/me', (req, res) => {
  // json-server-auth가 자동으로 req.user에 사용자 정보를 넣어준다.
  // JWT 토큰이 유효한 경우에만
  if (!req.user) {
    return res.status(401).json({ error : '인증이 필요합니다'});
  }

  const db = router.db;
  const userId = req.user.id; // JWT에서 추출한 사용자 ID

  // DB에서 해당 사용자 정보 찾기
  const user = db.get('users')
      .find({ id:userId })
      .value();

  if (!user) {
    return res.status(404).json({ error : '사용자를 찾을 수 없습니다' });
  }

  // 비밀번호는 제외하고 반환
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});



// 2. 닉네임 중복 체크 API
server.get('/users/check-nickname', (req, res) => {
  const nickname = req.query.nickname;

  if (!nickname) {
    return res.status(400).json({ error: '닉네임을 입력해주세요' });
  }
  const db = router.db;

  // 본인 제외하고 중복 체크
  const currentUserId = req.user ? req.user.id : null;

  const existingUser = db.get('users')
      .find(user =>
          user.nickname === nickname &&
          user.id !== currentUserId
      )
      .value();
  // available: true면 사용 가능, false면 이미 사용 중
  res.json({ available: !existingUser });
});


// 3. 닉네임 변경 API
server.patch('/users/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ error: '닉네임을 입력해주세요' });
  }

  // 닉네임 유효성 검사 (2-20자)
  if (nickname.length < 2 || nickname.length > 20) {
    return res.status(400).json({ error: '닉네임은 2-20자 사이여야 합니다' });
  }
  const db = router.db;
  const userId = req.user.id;

  // 중복 체크 (본인 제외)
  const duplicate = db.get('users')
      .find(user => user.nickname === nickname && user.id !== userId)
      .value();
  if (duplicate) {
    return res.status(409).json({ error: '이미 사용 중인 닉네임입니다' });
  }

  // DB 업데이트
  db.get('users')
      .find({ id: userId })
      .assign({ nickname: nickname })
      .write();

  // 업데이트된 사용자 정보 반환
  const updatedUser = db.get('users')
      .find({ id: userId })
      .value();
  const { password, ...userWithoutPassword } = updatedUser;
  res.json(userWithoutPassword);
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

// 파일 삭제 API 추가
server.delete('/upload/files/:filename', (req, res) => {

  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filepath)) {
    fs.unlink(filepath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '파일 삭제 실패' });
      }
      res.json({ message: '파일 삭제 성공' });
    });
  } else {
    res.status(404).json({ error: '파일을 찾을 수 없습니다' });
  }
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
