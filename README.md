# WoreNet
Get preview of wordnet, and read This to MySQL with nodejs

## what is wordnet
see https://wordnet.princeton.edu/

## how to use this repo?
- `./dict` store all source files of those vocabulary which download from https://wordnet.princeton.edu/
- however, some files are very big, if you want to get a priview of them, you can checkout `./preview`
- `./nodejs` store scripts written by nodejs which can help you read those files to mysql.

## db tables
create database in MySQL to store our tables.
``` sql
CREATE DATABASE wordnet;

USE wordnet;
```
### adj.exc
This file stores normal and comparative levels of adjectives.
``` sql
CREATE TABLE IF NOT EXISTS adj_exc(
  comparative VARCHAR(30) NOT NULL, 
  normal VARCHAR(30) NOT NULL,  
  UNIQUE KEY (comparative, normal));

INSERT INTO adj_exc(comparative, normal) 
  VALUES ('artier', 'arty');
```
and comparative + normal should be unique.

### adv.exc
This file stores normal and comparative levels of adverbs.
``` sql
CREATE TABLE IF NOT EXISTS adv_exc(
  comparative VARCHAR(30) NOT NULL, 
  normal VARCHAR(30) NOT NULL,  
  UNIQUE KEY (comparative, normal));

INSERT INTO adv_exc(comparative, normal) 
  VALUES ('farther', 'far');
```
and comparative + normal should be unique.

### noun.exc
This file stores plural and singular mode of noun.
``` sql
CREATE TABLE IF NOT EXISTS noun_exc(
  plural VARCHAR(30) NOT NULL, 
  singular VARCHAR(30) NOT NULL,  
  UNIQUE KEY (plural, singular));

INSERT INTO noun_exc(plural, singular) 
  VALUES ('aardwolves', 'aardwolf');
```
and plural + singular should be unique.

## index.noun index.adj index.verb index.adv
each line has many fields:
```
frisch n 3 1 @ 3 0 10983172 10983007 10982870  
```
- `frisch` tell us which word it is
- `n` indicate is a noun, in `index.noun`, all of then is `n`
- `3` indicates it has three means; index of then are last three noumber.
``` sql
CREATE TABLE IF NOT EXISTS word_index (
  word VARCHAR(300) NOT NULL,
  class CHAR(1) NOT NULL,
  means_index VARCHAR(3000) NOT NULL,
  UNIQUE KEY (word, class));

INSERT INTO word_index(word, class, means_index) 
  VALUES ('frisch', 'n', '10983172 10983007 10982870');
```
word `break` is too long.....

tabel name can not be `index`;

## data.*
```
00001740 03 n 01 entity 0 003 ~ 00001930 n 0000 ~ 00002137 n 0000 ~ 04424418 n 0000 | that which is perceived or known or inferred to have its own distinct existence (living or nonliving) 
```
- `00001740` id of a word
- `entity` word itself
``` sql
CREATE TABLE IF NOT EXISTS word (
  word VARCHAR(300) NOT NULL,
  class CHAR(1) NOT NULL,
  means VARCHAR(6000) NOT NULL);

INSERT INTO word(word, class, means_index) 
  VALUES ('entity', 'n', 'that which is perceived or known or inferred to have its own distinct existence (living or nonliving)');
```