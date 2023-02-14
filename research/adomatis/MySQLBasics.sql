CREATE DATABASE record_company;
USE record_company;
DROP TABLE test;
CREATE TABLE bands (
	id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE albums (
	id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    release_year int,
    band_id INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (band_id) REFERENCES bands (id)
);

INSERT INTO bands (name)
VALUES ('Grateful Dead');
INSERT INTO bands (name)
VALUES ('Tool'), ('Phish'), ('Goose');

SELECT * FROM bands;