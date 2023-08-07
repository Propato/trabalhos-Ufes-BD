# T3 - Bando de Dados I

Este é segundo trabalho da disciplina de Banco de Dados I ministrada pelo professor Rodrigo Laiola e desenvolvido por David Propato. Comumente chamado de T3 para melhor organização das atividades avaliativas ao longo do período.

Consiste na implementação de um algoritmo para verificação se um escalonamento (schedule) é estrito. Tendo por objetivo auxiliar os alunos na compreensão da teoria de processamento de transações, em particular, na caracterização de schedules com base na sua facilidade de recuperação.

Assim, foi desenvolvido uma função SQL no MySQL 5.7 para realizar uma análise sobre a tabela Schedule, que representa as transações sobre um banco de dados, armazenando o tempo da transação (time), Id da transação (#t), a operação realizada (R = Read, W = Write, A = Abort, C = Commit) e o item de dados passivo da operação.

## Desenvolvimento

Neste trabalho foram desenvolvidos os arquivos SQL e docker-compose para executar os comandos SQL dentro de um ambiente proprício. UM arquivo d-script.sh também foi definido para maior simplicidade na execução dos comandos.

Os comandos e comentários sobre a criação da tabela, índice e da função projetada podem ser encontrados no arquivo <a href="init/schedule.sql">init/schedule.sql</a>

Qualquer conjunto de dados que se deseja testar, recomenda-se inserir o arquivo SQL com os comandos de inserção dentro da pasta inputs adicionando o comando ```DELETE FROM `Schedule`;``` antes da inserção dos dados para que não sejam mantidos dados não relacionados que possam corromper o teste. Exemplos estão disponíveis na pasta inputs, cada arquivo possui um comentario informando se ele é um escalonamento estrito ou não.

## Pré-requisitos

Para plena execução dos arquivos deste trabalho é necessário ter a ferramenta docker instalada.

Para a realização dos comandos docker através do script `d-script.sh` é necessário executar o comando:

```chmod +x d-script.sh```

## Iniciar

Abrindo o terminal dentro desta pasta execute os seguintes comandos:

- ```docker-compose up -d```
- ```docker container ls```

Caso tenho ativado o script:

- ```./d-script.sh up```
- ```./d-script.sh ls```

## Executar

Após executar o build e confirmar que o container está ativo, acesse dentro dele para executar os comando SQL através do comando:

- ```docker exec -it mysql_T3_Propato mysql -u root -p db```

Ou, com o script:

- ```./d-script.sh open```

Após inserção do comando, será pedida uma senha, a senha é `Propato`.

Estando dentro do container, execute um comando SELECT simples para confirmar que tudo está rodando conforme previsto:

- ```SELECT * FROM Schedule;```

O banco iniciará vazio mas ele possui persistencia de dados, portanto, se for preenchido em algum momento, ele continuará até que os dados sejam deletados com ```DELETE FROM `Schedule`;```.

Estando o container funcionando corretamente, selecione o conjunto de dados à analisar se representam um escalonamento estrito ou não com a função através dos comandos:

- ```source inputs/<arquivo_teste>.sql```
- ```SELECT `testeScheduleEstrito`() AS resp;```

Ou

- ``` source function/function.sql```

A função e sua chamada também estão definidas dentro deste arquivo, por isto podem ser invodadas através dele. Contudo, como a função também é definida no arquivo inicial, a chamada da função direto no terminal também é válida.

Recebendo a saída da função igual à:

```
+------+
| resp |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

Sendo a resp 1 ou 0 a indicação se o escalonamento é estrito ou não.

Para realizar mais testes com novos dados de entrada, realize novamente a chamada dos dados e depois a chamada da função:

- ```source inputs/<arquivo_teste>.sql```
- ```SELECT `testeScheduleEstrito`() AS resp;```

## Parar

Para sair do container:

- ```Ctrl + D```

Para encerrar o container:

- ```docker-compose down```

Ou

- ```./d-script.sh down```

## Script

O script usado nete trabalho tabmém tem uma função de re-start caso seja necessária:

- ```./d-script.sh restart```

Que é equivalente à:

- ```docker-compose down```
- ```docker-compose up -d```

## Exemplo de execução

- COM script:

```
chmod +x d-script.sh
./d-script.sh up
./d-script.sh ls

./d-script.sh open

Propato

SELECT * FROM Schedule;

source inputs/example_01.sql
SELECT `testeScheduleEstrito`() AS resp;

source inputs/example_02.sql
SELECT `testeScheduleEstrito`() AS resp;

source inputs/teste_01.sql
SELECT `testeScheduleEstrito`() AS resp;

Ctrl + D
./d-script.sh down
```

- SEM script:

```
docker-compose up -d
docker container ls

docker exec -it mysql_T3_Propato mysql -u root -p db

Propato

SELECT * FROM Schedule;

source inputs/example_01.sql
SELECT `testeScheduleEstrito`() AS resp;

source inputs/example_02.sql
SELECT `testeScheduleEstrito`() AS resp;

source inputs/teste_01.sql
SELECT `testeScheduleEstrito`() AS resp;

Ctrl + D
docker-compose down
```