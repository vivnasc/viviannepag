# Banco de prompts de imagem
## Os 7 Sinais de Desencaixe

Norma: texto de marca em portugues pre-AO90, sem travessoes. Um prompt por sinal, ja com a paleta, a assinatura e as proibicoes desta porta preenchidas.

Base: `FICHA_VISUAL_Os_7_Sinais_de_Desencaixe.md` e `CONSTITUICAO_Os_7_Sinais_de_Desencaixe.md`.

---

## Assinatura e regras da porta (aplicar a todos os prompts)

- **Pergunta da porta:** como continuo a pertencer sem me abandonar?
- **Assinatura visual:** o Limiar. Porta, janela, escada, varanda, soleira, corredor, entardecer, amanhecer. Sempre travessia, nunca chegada nem partida.
- **Registo:** cerca de 85 por cento fotografia cinematografica de interiores e luz natural. Ilustracao so em workbooks ou mapas.
- **Temperatura:** suave, domestica, humana, por volta de 4 em 10. Muito mais baixa do que as Faces.
- **Sensacao dominante:** transicao, pertenca, serenidade, saudade. A saudade existe mas nao comanda. A emocao que define tudo: ainda nao estou totalmente do outro lado, mas ja nao estou exactamente aqui.
- **Regra maior:** nunca ilustrar literalmente o conceito. Casa e pertenca interior, nunca so espaco fisico. Mostrar a subtileza do desencaixe, nunca a ruptura dramatica.
- **Paleta:** fundo quente `#F4EFE8`, luz de interior `#E8D5B5`, dourado `#C7A96B`, madeira `#A67C52`, sombra suave `#6E6256`, horizonte `#D8B07C`, azul residual `#7D8797`.
- **Proibido:** partida, ruptura, malas, comboios, aeroportos, passaros a voar, tempestade dramatica, ilustracao literal, correntes, gaiolas, labirintos, pecas de puzzle, mascaras partidas, estradas infinitas, silhuetas a caminhar sozinhas, pessoas de costas em penhascos, borboletas, asas, bussolas partidas, cidades futuristas, tecnologia visivel, neon.

---

## Modelo base

```
Universo: Os 7 Sinais de Desencaixe
Sinal: <nome>
Cena: interior habitado ou limiar, luz de fim de tarde a atravessar um vazio
Assinatura: o Limiar, porta, janela, escada, varanda, soleira, sempre travessia
Objectos possiveis: <motivo do sinal>, chavena, manta, cadeira, planta, cortina
Paleta: fundo #F4EFE8, luz #E8D5B5, dourado #C7A96B, madeira #A67C52, azul residual #7D8797
Proibido: partida, ruptura, malas, comboios, aeroportos, passaros, tempestade, ilustracao literal
Emocao: transicao serena, nunca nostalgia dramatica
Registo: fotografia cinematografica de interiores e luz natural
```

---

## 1. A Mesa

Reconhecimento: "estou aqui mas nao estou em casa." Tema: presenca sem pertenca.

```
Universo: Os 7 Sinais de Desencaixe
Sinal: A Mesa
Cena: uma mesa posta apos um jantar, uma cadeira ligeiramente afastada, um lugar que ja nao reconhece quem la se senta
Assinatura: a luz de fim de tarde a atravessar a sala pela porta entreaberta ao fundo
Objectos possiveis: mesa, cadeiras, lugares marcados, cozinha, fotografia, luz de jantar
Paleta: fundo #F4EFE8, luz #E8D5B5, dourado #C7A96B, madeira #A67C52, azul residual #7D8797
Proibido: partida, malas, ruptura, ilustracao literal
Emocao: presenca sem pertenca, transicao serena
Registo: fotografia cinematografica de interiores e luz natural
```

## 2. A Mascara

Reconhecimento: "estou a ficar mais pequena para caber." Tema: autoabandono funcional.

```
Universo: Os 7 Sinais de Desencaixe
Sinal: A Mascara
Cena: um reflexo num espelho ou num vidro de janela, uma versao mais contida da pessoa, a voz baixa de quem deixou de discordar
Assinatura: o vidro como limiar entre quem se e e quem se mostra, luz de interior a atravessa-lo
Objectos possiveis: espelhos, reflexos, vidros, roupa apertada, silencios
Paleta: fundo #F4EFE8, luz #E8D5B5, dourado #C7A96B, madeira #A67C52, azul residual #7D8797
Proibido: mascaras partidas, ruptura, pessoas a gritar, ilustracao literal
Emocao: autoabandono silencioso, transicao serena
Registo: fotografia cinematografica de interiores e luz natural
```

## 3. O Horizonte

Reconhecimento: "tenho saudades de algo que nunca vivi." Tema: o chamamento.

```
Universo: Os 7 Sinais de Desencaixe
Sinal: O Horizonte
Cena: uma pessoa a uma janela ao amanhecer, o mar ou a distancia la fora, uma saudade de algo que ainda nao encontrou casa
Assinatura: a janela como limiar, o azul residual do entardecer a fazer a ponte com o horizonte
Objectos possiveis: janelas, mar, distancia, amanheceres, luz de transicao
Paleta: fundo #F4EFE8, luz #E8D5B5, dourado #C7A96B, madeira #A67C52, horizonte #D8B07C, azul residual #7D8797
Proibido: estradas infinitas, passaros, bussolas, comboios, aeroportos, ilustracao literal
Emocao: chamamento sereno, nunca nostalgia dramatica
Registo: fotografia cinematografica de interiores e luz natural
```

## 4. O Eremita

Reconhecimento: "ou pertenco ou sou eu." Tema: o isolamento como defesa.

```
Universo: Os 7 Sinais de Desencaixe
Sinal: O Eremita
Cena: uma porta fechada por dentro, nevoeiro suave la fora, o silencio de quem ja nao sabe se se protege ou se esconde
Assinatura: a porta fechada como limiar suspenso, luz quente de um so lado
Objectos possiveis: portas fechadas, nevoeiro, cabana, montanha, ilha
Paleta: fundo #F4EFE8, luz #E8D5B5, dourado #C7A96B, madeira #A67C52, azul residual #7D8797
Proibido: ruptura, tempestade dramatica, silhuetas sozinhas em penhascos, ilustracao literal
Emocao: recolhimento ambivalente, transicao serena
Registo: fotografia cinematografica de interiores e luz natural
```

## 5. O Corpo

Reconhecimento: "ja nao consigo." Tema: o corpo sabe primeiro.

```
Universo: Os 7 Sinais de Desencaixe
Sinal: O Corpo
Cena: ombros descaidos ao fim do dia, um tecido que cai, a respiracao lenta de quem descansou e continua cansado
Assinatura: a luz de interior a atravessar o tecido, o limiar entre o esforco e o que o corpo ja sabe
Objectos possiveis: tecidos, pele, respiracao, ombros, cansaco, luz difusa
Paleta: fundo #F4EFE8, luz #E8D5B5, dourado #C7A96B, madeira #A67C52, sombra suave #6E6256
Proibido: ruptura, multidoes ruidosas, drama, ilustracao literal
Emocao: exaustao serena, transicao silenciosa
Registo: fotografia cinematografica de interiores e luz natural
```

## 6. O Refugio

Reconhecimento: "talvez seja melhor sozinha." Tema: o conforto que se transforma em prisao.

```
Universo: Os 7 Sinais de Desencaixe
Sinal: O Refugio
Cena: uma manta, uma chavena quente, chuva na janela, o conforto que comeca a fechar-se demais sobre si
Assinatura: a janela como limiar entre o abrigo e o mundo, luz quente por dentro, chuva suave por fora
Objectos possiveis: mantas, chavenas, lareira, chuva na janela, casa fechada
Paleta: fundo #F4EFE8, luz #E8D5B5, dourado #C7A96B, madeira #A67C52, azul residual #7D8797
Proibido: gaiolas, prisao literal, tempestade dramatica, ilustracao literal
Emocao: conforto ambiguo, transicao serena
Registo: fotografia cinematografica de interiores e luz natural
```

## 7. A Casa

Reconhecimento: "o problema nunca foi pertencer. Era o preco da pertenca." Tema: pertenca consciente.

```
Universo: Os 7 Sinais de Desencaixe
Sinal: A Casa
Cena: uma porta aberta para um jardim ao fim da tarde, luz quente a sair de dentro, o regresso a um lugar que nao exige desaparecimento
Assinatura: a porta aberta como limiar cumprido, luz quente a atravessar a soleira
Objectos possiveis: portas abertas, jardins, luz quente, raizes, casa iluminada
Paleta: fundo #F4EFE8, luz #E8D5B5, dourado #C7A96B, madeira #A67C52, horizonte #D8B07C
Proibido: partida, malas, ruptura, ilustracao literal
Emocao: pertenca inteira, transicao serena
Registo: fotografia cinematografica de interiores e luz natural
```

---

## A identidade numa frase

Os Sinais sao a unica porta que cheira a casa. Falam do lugar para onde regressas quando deixas de te proteger.
