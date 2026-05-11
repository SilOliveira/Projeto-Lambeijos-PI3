-- Recria a tabela pets com a coluna image_url
DROP TABLE IF EXISTS pets;

CREATE TABLE pets (
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