CREATE DATABASE IF NOT EXISTS henna_client_db;
USE henna_client_db;

CREATE TABLE IF NOT EXISTS clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20),
    portfolio_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clients_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    status ENUM('Planning', 'In-Progress', 'Review', 'Completed') DEFAULT 'Planning',
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    INDEX idx_projects_client (client_id),
    INDEX idx_projects_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meetings (
    meeting_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    meeting_date DATETIME NOT NULL,
    location VARCHAR(200) DEFAULT 'Virtual / Google Meet',
    agenda TEXT,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    INDEX idx_meetings_client (client_id),
    INDEX idx_meetings_date (meeting_date)
) ENGINE=InnoDB;

INSERT IGNORE INTO clients (name, company_name, email, phone, portfolio_url) VALUES
('Maya Patel', 'North & Pine Studio', 'maya@northpine.studio', '+1-415-204-1008', 'https://northpine.studio'),
('Ethan Cole', 'Aster & Alder', 'ethan@asteralder.co', '+1-310-420-8802', 'https://www.asteralder.co');

INSERT INTO meetings (client_id, title, meeting_date, location, agenda, status)
SELECT c.client_id, 'Brand Direction Review',
       DATE_ADD(NOW(), INTERVAL 2 DAY),
       'Studio North',
       'Align on positioning, messaging, and next milestone goals',
       'Scheduled'
FROM clients c
WHERE c.email = 'maya@northpine.studio'
  AND NOT EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.client_id = c.client_id
        AND m.title = 'Brand Direction Review'
  );
