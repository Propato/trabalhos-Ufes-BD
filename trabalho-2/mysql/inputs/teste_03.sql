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
(48, 3, 'C', '-'),
(151, 11, 'R', 'X'),
(171, 21, 'R', 'Z'),
(221, 11, 'R', 'Z'),
(231, 31, 'R', 'X'),
(261, 31, 'R', 'Y'),
(341, 11, 'W', 'X'),
(351, 31, 'W', 'Y'),
(371, 21, 'R', 'Y'),
(381, 21, 'W', 'Z'),
(401, 21, 'W', 'Y'),
(411, 11, 'C', '-'),
(441, 21, 'C', '-'),
(481, 31, 'C', '-');