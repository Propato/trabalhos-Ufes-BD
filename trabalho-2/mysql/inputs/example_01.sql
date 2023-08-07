-- example_01 (MySQL 5.7)
DELETE FROM `Schedule`; -- DELETE para executar a função de testagem apenas sobre os dados inseridos abaixo.

-- Este é um Escalonamento Estrito
INSERT INTO `Schedule` (`time`, `#t`, `op`, `attr`) VALUES
(1, 1, 'R', 'X'),
(2, 2, 'R', 'Z'),
(3, 1, 'R', 'Z'),
(4, 3, 'R', 'X'),
(5, 3, 'R', 'Y'),
(6, 1, 'W', 'X'),
(7, 1, 'C', '-'),
(8, 3, 'W', 'Y'),
(9, 3, 'C', '-'),
(10, 2, 'R', 'Y'),
(11, 2, 'W', 'Z'),
(12, 2, 'W', 'Y'),
(13, 2, 'C', '-');
