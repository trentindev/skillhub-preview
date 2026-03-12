CREATE TABLE IF NOT EXISTS workshops (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO workshops (title, description, date) VALUES
  ('Introduction à React', 'Atelier de découverte de React et des composants', '2024-06-01 10:00:00'),
  ('Docker pour les développeurs', 'Conteneurisation et bonnes pratiques Docker', '2024-06-15 14:00:00'),
  ('CI/CD avec GitHub Actions', 'Mise en place d''un pipeline CI/CD complet', '2024-06-22 09:00:00');