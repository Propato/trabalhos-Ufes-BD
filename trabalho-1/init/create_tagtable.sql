\connect bocadb;

DROP TABLE IF EXISTS "tagtable" CASCADE;
CREATE TABLE "public"."tagtable" (
    "contestnumber" integer NOT NULL,
    "entitytype" character varying(10) NOT NULL,
    "entitynumber" character varying(15) NOT NULL,
    "tagnumber" integer NOT NULL,
    "tagname" character varying(20) NOT NULL,
    "tagvalue" character varying(50) NOT NULL,
    
    CONSTRAINT "tag_index" UNIQUE ("contestnumber", "entitytype", "entitynumber", "tagnumber"),
    CONSTRAINT "tag_pkey" PRIMARY KEY ("contestnumber", "entitytype", "entitynumber", "tagnumber"),
    CONSTRAINT "contest_fk" FOREIGN KEY (contestnumber) REFERENCES contesttable(contestnumber) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE
) WITH (oids = false);

-- Uma única tabela pensada e definida pois o caminho para isto se baseou na ideia de uma relação 1xN entre Entidade do Boca x Tags, assim, sendo definica a tabela das tags (tagnumber, tagname, tagvalue) e inserindo a chave composta da entidade, para concretizar a relação, ou seja, a tabela tagtable armazena a tag e a chave para a endidade que possui a tag.
-- Sendo uma Entidade compreendida como qualquer elemente das tabelas do banco de dados, sendo o foco desde trabalho as entidades das tabelas problemtable (entitytype= problem), langtable (entitytype= language), sitetable (entitytype= site), usertable (entitytype= site/user), sendo, para todos os casos, a chave composta desses elementos o contestnumber (que indica o contest que o elemento faz parte), entitytype (que indica o tipo do elemento e, consequentemente, a tabela que ele esta armazenado) e entitynumber (que é o id do elemento na sua tabela).