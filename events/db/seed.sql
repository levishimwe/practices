USE app_event;

INSERT INTO categories (name)
VALUES ('Music'), ('Sports'), ('Tech'), ('Food'), ('Art')
ON DUPLICATE KEY UPDATE name = VALUES(name);
