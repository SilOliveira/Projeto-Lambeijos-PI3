// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/pets') // Certifique-se de que este diretório existe
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Por favor, envie apenas imagens jpg, jpeg ou png!'));
    }
    cb(null, true);
  }
});

// Configuração dos middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads')); // Servir arquivos estáticos da pasta uploads

// Conexão com o MySQL utilizando um pool de conexões
const db = mysql.createPool({
  host: 'localhost', // Somente 'localhost'
  port: 3306,        // Especifica a porta separadamente (opcional, pois 3306 é o padrão)
  user: 'root',       // Substitua pelo seu usuário do MySQL
  password: '01404002Aa*',     // Substitua pela sua senha do MySQL
  database: 'adocao_site'
});

// Testa a conexão com o MySQL
db.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conexão com MySQL bem-sucedida!');
    connection.release();
  }
});

// Endpoint para buscar os pets, com suporte a filtros via query string
app.get('/api/pets', (req, res) => {
  let sql = 'SELECT *, image_url as imageUrl FROM pets';
  let filters = [];
  let queryParams = [];

  if (req.query.type) {
    filters.push('type = ?');
    queryParams.push(req.query.type);
  }
  if (req.query.breed) {
    filters.push('breed = ?');
    queryParams.push(req.query.breed);
  }
  if (req.query.size) {
    filters.push('size = ?');
    queryParams.push(req.query.size);
  }
  if (req.query.age) {
    filters.push('age = ?');
    queryParams.push(req.query.age);
  }
  if (req.query.location) {
    filters.push('location = ?');
    queryParams.push(req.query.location);
  }

  if (filters.length > 0) {
    sql += ' WHERE ' + filters.join(' AND ');
  }

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar pets' });
    }
    // Garante que a URL da imagem está completa
    const petsWithFullImageUrl = results.map(pet => ({
      ...pet,
      imageUrl: pet.imageUrl ? pet.imageUrl : '/api/placeholder/400/300'
    }));
    res.json(petsWithFullImageUrl);
  });
});

// Endpoint para cadastro de usuário
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.execute(sql, [name, email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Erro ao cadastrar usuário" });
    }
    res.json({ success: true, message: "Cadastro realizado com sucesso", userId: results.insertId });
  });
});

// Endpoint para login de usuário
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.execute(sql, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Erro ao realizar login" });
    }
    if (results.length > 0) {
      res.json({ success: true, message: "Login realizado com sucesso", user: results[0] });
    } else {
      res.json({ success: false, message: "Credenciais inválidas" });
    }
  });
});

// Endpoint para solicitação de adoção
app.post('/api/adopt', (req, res) => {
  const { petName, name, email, phone, address, reason, experience, home } = req.body;
  const sql = "INSERT INTO adoption_requests (pet_name, user_name, email, phone, address, reason, experience, home) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.execute(sql, [petName, name, email, phone, address, reason, experience, home], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Erro ao enviar solicitação de adoção" });
    }
    res.json({ success: true, message: "Solicitação de adoção enviada com sucesso", requestId: results.insertId });
  });
});

// Endpoint para cadastro de pet para adoção
app.post('/api/registerPet', upload.single('photo'), (req, res) => {
  const { type, name, breed, age, size, gender, description, location } = req.body;
  const photoUrl = req.file ? `/uploads/pets/${req.file.filename}` : null;

  const sql = "INSERT INTO pets (type, name, breed, age, size, gender, description, location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  
  db.execute(sql, [type, name, breed, age, size, gender, description, location, photoUrl], (err, results) => {
    if (err) {
      console.error('Erro na query:', err);
      return res.status(500).json({ success: false, message: "Erro ao cadastrar pet" });
    }
    res.json({ 
      success: true, 
      message: "Pet cadastrado com sucesso para adoção", 
      petId: results.insertId,
      imageUrl: photoUrl
    });
  });
});

// Endpoint para solicitação de parceria
app.post('/api/partner', (req, res) => {
  const { partnerName, partnerType, partnerContact, partnerEmail, partnerPhone, partnerAddress, partnerCity, partnerState, partnerDescription } = req.body;
  const sql = "INSERT INTO partners (name, type, contact, email, phone, address, city, state, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.execute(sql, [partnerName, partnerType, partnerContact, partnerEmail, partnerPhone, partnerAddress, partnerCity, partnerState, partnerDescription], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Erro ao enviar solicitação de parceria" });
    }
    res.json({ success: true, message: "Solicitação de parceria enviada com sucesso", partnerId: results.insertId });
  });
});

// Endpoint para gerar imagens placeholder
app.get('/api/placeholder/:width/:height', (req, res) => {
  const width = parseInt(req.params.width) || 300;
  const height = parseInt(req.params.height) || 300;
  
  // Cria um SVG simples como placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy=".3em">
        Imagem Indisponível
      </text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
