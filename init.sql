
-- Creazione del database (se non esiste già)
CREATE DATABASE IF NOT EXISTS booksLibrary;

-- Selezione del database
USE booksLibrary;

-- Creazione di una tabella di esempio
CREATE TABLE IF NOT EXISTS books (
    idBook INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(45) NOT NULL,
    description VARCHAR(255) NOT NULL,
    cover VARCHAR(255) NOT NULL,
    price DOUBLE NOT NULL,
    fkUser INT NOT NULL
);

-- Creazione di un'altra tabella di esempio
CREATE TABLE IF NOT EXISTS users (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL
);
