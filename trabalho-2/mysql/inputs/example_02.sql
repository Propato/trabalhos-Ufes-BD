-- example_02 (MySQL 5.7)
DELETE FROM `Schedule`; -- DELETE para executar a função de testagem apenas sobre os dados inseridos abaixo.

-- Este é um Escalonamento NÃO Estrito
INSERT INTO `Schedule` (`time`, `#t`, `op`, `attr`) VALUES
(15, 1, 'R', 'X'),
(17, 2, 'R', 'Z'),
(22, 1, 'R', 'Z'),
(23, 3, 'R', 'X'),
(26, 3, 'R', 'Y'),
(34, 1, 'W', 'X'),
(35, 3, 'W', 'Y'),
(37, 2, 'R', 'Y'),
(38, 2, 'W', 'Z'),
(40, 2, 'W', 'Y'),
(41, 1, 'C', '-'),
(44, 2, 'C', '-'),
(48, 3, 'C', '-');
