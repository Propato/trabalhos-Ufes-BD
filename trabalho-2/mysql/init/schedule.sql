-- Definição DDL da estrutura do Banco de Dados.
DROP DATABASE IF EXISTS `db`;
CREATE DATABASE `db`;
USE `db`;

-- Definição da relação Schedule.
DROP TABLE IF EXISTS `Schedule`;
CREATE TABLE `Schedule` (
  `time` int NOT NULL,
  `#t` int NOT NULL,
  `op` char(1) NOT NULL,
  `attr` varchar(10) NOT NULL,
  UNIQUE (`time`)
) ENGINE=InnoDB;

-- Definição de um Índice de BTree para maior eficiência das buscas.
CREATE INDEX idx_time_btree
ON Schedule (`time` ASC)
USING BTREE
;

-- Definição da função que testa se um escalonamento é estrito (return 1) ou não (return 0).

-- "Em um schedule estrito as transações não podem ler nem gravar um item X até que a última transação que gravou X tenha sido confirmada (ou cancelada)."
DELIMITER //
DROP FUNCTION IF EXISTS `testeScheduleEstrito`;
CREATE FUNCTION `testeScheduleEstrito` ()
RETURNS INT
DETERMINISTIC
BEGIN
  
  IF
    NOT EXISTS (
      SELECT *
      FROM Schedule AS S
      WHERE S.`op` IN ('R', 'W')
      AND EXISTS (
        SELECT T1.`time`, T1.`#t`, T1.`attr`, T2.`time`
        FROM Schedule AS T1
        JOIN Schedule AS T2
        ON T1.`#t` = T2.`#t`
        WHERE T1.`op` = 'W'
        AND T2.`op` IN ('A', 'C')
        AND S.`#t` != T1.`#t`
        AND S.`attr` = T1.`attr`
        AND S.`time` > T1.`time`
        AND S.`time` < T2.`time`
      )
    )
  THEN
    RETURN 1;
  ELSE
    RETURN 0;
  END IF;

END; //

-- Quando uma operação Write sobre um item de dados X de uma determinada transação Ti é identificada, outras transações só poderão executar um Read ou Write sobre o item X depois que for identificada um Commit ou Abort da Transação Ti. Assim, para cada linha 'Ti | W | X', será necessário realizar uma busca no intervalo de tempo entre 'Ti | W | X' e 'Ti | A | - ' ou 'Ti | W | X' e 'Ti | C | - ' para checar se há alguma operação sobre X que não seja de Ti, ou seja, se há alguma tupla 'Tj | W | X' ou 'Tj | R | X', caso existam uma tupla assim, este escalonamento não será estrito.