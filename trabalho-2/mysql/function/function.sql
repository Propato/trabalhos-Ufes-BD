-- function signature (MySQL 5.7)

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

-- Quando uma operação W sobre um item de dados X de uma determinada transação T é identificada, outras transações só poderam executar um R ou W sobre o item X depois que for identificada um C ou A da Transação T. Assim, para cada linha 'T1 | W | X', será necessário realizar uma busca no intervalo de tempo entre 'T1 | W | X' e 'T1 | A/C | - ' para checar se há alguma operação sobre X que nao seja de T1, ou seja, se há alguma tupla 'T# | W/R | X', caso existam uma tupla assim, este schedule não será estrito.

-- calling function
SELECT `testeScheduleEstrito`() AS resp;
