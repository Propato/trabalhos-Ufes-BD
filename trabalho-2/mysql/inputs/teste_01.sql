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
(13, 2, 'C', '-'),
(112, 112, 'R', 'X'),
(212, 212, 'R', 'Z'),
(312, 112, 'R', 'Z'),
(412, 312, 'R', 'X'),
(512, 312, 'R', 'Y'),
(612, 112, 'W', 'X'),
(712, 112, 'C', '-'),
(812, 312, 'W', 'Y'),
(912, 312, 'C', '-'),
(1012, 212, 'R', 'Y'),
(1112, 212, 'W', 'Z'),
(1212, 212, 'W', 'Y'),
(1312, 212, 'C', '-');
