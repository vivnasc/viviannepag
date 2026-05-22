# PROMPT PARA CLAUDE CODE, MUDAR AUTORIA DA SYNCHIM

Cola no Claude Code, na raiz do repositório da SyncHim.

────────────────────────────────────────────────────────

A SyncHim era assinada por uma persona chamada "Marina Vale". Decidi assumir o produto com o meu nome real, Vivianne dos Santos. Faz a mudança de autoria em toda a aplicação, com cuidado para não partir nada. A VOZ do conteúdo não muda (continua íntima, na segunda pessoa); muda só QUEM assina.

## O que mudar

1. Procura no projeto inteiro por "Marina Vale", "Marina" e "marina" (case-insensitive). Para cada ocorrência, decide pelo contexto:
   - Assinatura de sessões, autor, nome a mostrar -> "Vivianne dos Santos"
   - Nomes de variáveis, ficheiros, slugs tipo `marinaVale`, `author_marina`, `marina-vale` -> renomeia para `vivianneDosSantos`, `author_vivianne`, `vivianne-dos-santos` (mantém a convenção de cada sítio: camelCase, snake_case, kebab-case)
   - Textos de interface, meta tags, título do site, Open Graph -> "Vivianne dos Santos"
   - Se houver um campo de "bio do autor" ou página "sobre", substitui pela bio nova (mais abaixo)

2. Se o conteúdo das sessões estiver na base de dados (e não em ficheiros), gera um script de migração que faz UPDATE em todas as linhas onde o corpo ou a assinatura contém "Marina Vale", trocando por "Vivianne dos Santos". Mostra-me o script antes de o correr.

3. Se o conteúdo estiver em ficheiros markdown no repo (pasta /content ou similar), eu vou substituir esses ficheiros pelos novos já corrigidos (já tenho as versões com "Vivianne dos Santos"). Avisa-me quais ficheiros de conteúdo existem para eu os substituir.

4. NÃO mudes:
   - O nome do produto "SyncHim" nem "SyncMe" (esses ficam)
   - A estrela persa nem o travessão da assinatura (elementos gráficos de marca)
   - A paleta, a tipografia, o tom de voz, a estrutura
   - A revelação SyncHim -> SyncMe

## Bio nova do autor (se houver página "sobre" ou campo de bio)

Nome: Vivianne dos Santos
Subtítulo: terapeuta sistémica em formação, escritora e criadora

Texto:
Não vim dizer-te o que fazer no teu amor. Vim ajudar-te a ver o nó que o sabota, esse que vem de trás, dos padrões que herdaste sem escolher. Estudo os sistemas que nos formam, e foi disso que nasceu a SyncHim. Os casais não morrem por falta de amor. Morrem por dessincronia. E a sincronia começa quando voltas a ti.

## Regras
- Sem travessões (em-dash ou en-dash) em texto novo que escrevas. Usa vírgula, ponto, dois pontos ou parênteses. O único travessão permitido é o da assinatura (elemento de marca).
- Mostra-me a lista de todos os ficheiros que alteraste no fim.
- Se encontrares referências à conta de redes, o Instagram do produto passa a ser @synchim.app.

Começa por fazer a busca e mostrar-me todas as ocorrências de "Marina" que encontraste, agrupadas por tipo (assinatura, código, interface, base de dados), antes de alterar. Espero a minha confirmação.
