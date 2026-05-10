-- Criação do banco de dados se não existir
CREATE DATABASE IF NOT EXISTS adocao_site;
USE adocao_site;

-- Criação da tabela pets
CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Se a tabela já existir e precisar adicionar a coluna image_url
ALTER TABLE pets ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) AFTER location; 