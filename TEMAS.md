# Como criar um tema

Um tema é um arquivo JSON em `themes/`. O engine traz o curso de 21 lições (`course.js`), a digitação e as regras do jogo (`engine.js`), e é igual para todos os temas. O tema conta a história: etapas, rivais, falas, conquistas, cores e textos.

Um tema só precisa de `id` e das etapas. Todo o resto tem um padrão no engine ou em `i18n/`, e o tema sobrescreve o que quiser. `themes/jojo.json` e `themes/rush.json` são exemplos completos.

## Tema mínimo

```
{
  "id": "meutema",
  "journey": {
    "stages": [
      {"place": "Começo", "lessons": ["fj", "dk", "sl", "a", "gh", "r1"]},
      {"place": "Meio", "lessons": ["ei", "ru", "to", "nm", "c,", "qp", "r2"]},
      {"place": "Fim", "lessons": ["acc1", "acc2", "vb", "x.", "zwy", "r3", "shift", "quotes"]}
    ]
  }
}
```

Com isso o jogo funciona: a jornada aparece como uma linha reta, as etapas se chamam "Etapa 1", "Etapa 2" e "Etapa 3", e as frases são ditados populares.

## Passo a passo

1. Crie `themes/<nome>.json`, a partir do tema mínimo ou de uma cópia de um tema existente.
2. Copie `index.html` para `<nome>.html`. Troque o `<title>`, as og:meta e o `data-theme` do loader:

   ```
   <script src="loader.js?v=7" data-i18n="i18n/pt.json i18n/en.json" data-theme="themes/<nome>.json"></script>
   ```

3. Acrescente o tema em `themes.json`, com `id`, o `name` que aparece no seletor de tema e a `page`. O seletor no topo da página mostra todos os temas dessa lista.
4. Rode `just run` e abra `http://localhost:8000/<nome>.html`.
5. Rode `just test`. O teste `tests/themes.test.js` joga o curso inteiro com todo tema de `themes/`, então o tema novo já entra no teste. O teste também falha se o tema não estiver em `themes.json`.

Se o tema tiver um erro de estrutura, como uma lição que não existe ou um rival sem cadastro, a página mostra a lista de problemas em vez do jogo.

## Chaves do tema

| Chave | O que é | Padrão |
|---|---|---|
| `id` | nome curto do tema | obrigatório |
| `journey.stages` | as etapas (ver abaixo) | obrigatório |
| `storeKey` | chave do progresso no localStorage | `"typedojo:<id>"` |
| `siteUrl` | endereço publicado da página. O QR code usa esse endereço quando o jogo roda fora de um servidor http. | o endereço da página |
| `look` | `logo` (duas partes; a segunda aparece em destaque), `deco` (texto grande decorativo no fundo) e `colors` (`bg`, `panel`, `panel2`, `line`, `text`, `muted`, `accent`, `accent2`) | logo "TYPE DOJO", sem deco, cores de `engine.css` |
| `fx` | efeitos durante a digitação: `marks` (letras que sobem pelas bordas a cada 2 acertos seguidos, a partir de `marksAt`) e `rush` (palavra que explode na caixa a cada `rushEvery` acertos seguidos) | sem efeitos; `marksAt` 12 e `rushEvery` 25 |
| `strings` | textos da história. Uma chave com o mesmo nome de uma chave de `i18n/` substitui o texto comum. | os textos de `i18n/` |
| `hero` | o personagem do jogador: `name`, `short` (nome curto), `number` e `icon` | "Jogador", nº 1, ⌨️ |
| `mentor` | quem dá as dicas: `name` | "Treinador" |
| `words` | `names` e `terms`, palavras separadas por espaço que entram nas lições | só as palavras comuns |
| `quotes` | frases para digitar, cada uma como `[texto, autor]`. O jogo usa quantas houver, e pelo menos 3 precisam ter menos de 60 caracteres. | ditados populares |
| `journey.view` | como a jornada aparece: `"line"`, `"snake"` ou `"map"` (ver abaixo) | `"line"` |
| `journey.unit` e `journey.unitOne` | unidade da distância, no plural e no singular | "etapas" e "etapa" |
| `journey.marker` | ícone do jogador na jornada | 📍 |
| `rivals` | os rivais das corridas, por id | nenhum |
| `story` | narração por lição: `{"<id da lição>": {"narr": "...", "mentor": "..."}}` | nenhuma |
| `evolution` | o que evolui com o jogador: `name` e `levels`, cada nível com `label` e a `lesson` que o libera (um id do curso) | sem níveis |
| `prologue` | a história de abertura: `slides` e `where` | sem slides; `where` de `i18n/` |
| `achievements` | as conquistas | nenhuma |
| `ranks` | patentes por velocidade: `[ppm mínimo, nome em inglês, nome em português]` | de Iniciante a Lenda |

### Etapas (`journey.stages`)

```
{"lbl": "Etapa 2", "place": "Deserto do Arizona", "from": "Igreja Santa Maria Novella", "to": "Monument Valley",
 "dist": 1200, "label": "Monument Valley", "lessons": ["sl", "a", "gh", "r1"], "rival": "diego"}
```

- **`place` e `lessons`:** obrigatórios. Juntas, as etapas precisam cobrir as 21 lições do curso, na ordem do curso.
- **`lbl`:** o rótulo da etapa. O padrão é o texto `stage` seguido do número, como "Etapa 2".
- **`rival`:** opcional. A última lição de uma etapa com rival vira uma corrida contra ele.
- **`dist`:** o tamanho da etapa na unidade de `journey.unit`. Cada lição concluída avança uma fração da etapa. O padrão é 1.
- **`label`:** opcional, o rótulo do ponto da etapa na jornada.
- **Outros campos**, como `from`, `to` ou `year`, ficam disponíveis nos textos de etapa (ver abaixo).

As lições do curso, em ordem: `fj dk sl a gh r1 ei ru to nm c, qp r2 acc1 acc2 vb x. zwy r3 shift quotes`.

### Visualização da jornada (`journey.view`)

- **`line`:** uma linha reta da esquerda para a direita.
- **`snake`:** três fileiras, e a fileira do meio volta da direita para a esquerda. Serve para muitas etapas, como as 21 do Rush.
- **`map`:** cada etapa traz a sua posição em `pt` (`[x, y]`), e `journey.start` traz a posição da largada. O mapa usa a área `20 30 600 230` do SVG. `dy` ajusta a altura do rótulo.

### Textos de etapa

Três chaves de `strings` montam os textos de uma etapa. Elas aceitam qualquer campo da etapa, como `{lbl}`, `{place}`, `{from}` ou `{year}`, e `{dist}` com a unidade:

| Chave | Onde aparece | Padrão | JoJo |
|---|---|---|---|
| `stageHead` | título da etapa na aba de lições | `{lbl}: {place}` | `{lbl}: {from} → {to} · {dist}` |
| `stageTag` | etiqueta da etapa na abertura de cada lição | `{lbl}: {place}` | `{lbl}: {from} → {to}` |
| `stageRoute` | linha abaixo do nome da etapa na tela inicial | vazio | `{from} → {to}` |

### Rivais (`rivals`)

```
"diego": {"nm": "Diego Brando", "no": "001", "floor": 8, "pre": "...", "win": "...", "lose": "..."}
```

- **`nm`:** obrigatório, o nome do rival.
- **`floor`:** opcional, velocidade mínima do fantasma, em PPM. O fantasma corre 10% acima da média recente do jogador, ou 20% se `boss` for `true`, e nunca abaixo da meta de velocidade da lição.
- **`pre`, `win` e `lose`:** opcionais, a fala antes da corrida, a frase de vitória e a frase de derrota.
- **`no`:** opcional, o número de corredor do rival.

### Abertura (`prologue`)

- **`slides`:** cada slide tem `art` (um emoji, `"map"` para a jornada ou `"hands"` para as mãos no teclado), `title`, `narr` (lista de parágrafos) e `mentor` (opcional).
- **`where`:** o último slide, que mostra onde o jogador está. Cada forma substitui só os campos que definir, e os outros vêm de `i18n/`. São três formas:
  - `start`, antes da primeira lição: `title`, `narr` e `mentor`, sem marcadores;
  - `finished`, depois da última: `title`, `narr` e `mentor`. Só `narr` aceita um marcador, `{total}`;
  - `progress`, no meio do caminho: `title`, `distance`, `next`, `race` (acrescentado a `next` quando a próxima lição é corrida), `mission`, `missionDone` e `mentor` (usado quando a lição não tem fala do mentor em `story`). Os textos aceitam os campos da etapa atual e os marcadores `{dist}`, `{total}`, `{n}`, `{lesson}`, `{rival}` e `{done}`. `missionDone` e `mentor` não aceitam marcadores.

### Conquistas (`achievements`)

```
{"id": "ball", "s": "race", "ic": "⚪", "nm": "Bola de aço", "d": "Termine a etapa 1", "when": {"type": "stageCleared", "stage": 0}}
```

`s` é o grupo da conquista. Um `type` desconhecido, uma `lesson` que não existe ou uma `stage` fora das etapas aparecem na lista de problemas do tema. Os grupos aparecem na ordem da primeira conquista de cada um. O nome de cada grupo fica em `strings.collGroups`, por exemplo `{"race": "Partes do Cadáver Santo"}`; sem nome, o grupo mostra o próprio id. `when` diz quando a conquista é liberada:

| `type` | Parâmetros | Libera quando |
|---|---|---|
| `stageCleared` | `stage` (0 é a primeira) | a última lição da etapa tem pelo menos uma estrela |
| `lessonDone` | `lesson` | a lição tem pelo menos uma estrela |
| `racePlace` | `lesson`, `place` | o jogador chega nessa colocação ou melhor na corrida da lição |
| `perfectLesson` | `minChars` | uma lição termina com 100% de precisão e pelo menos esse número de caracteres |
| `rhythm` | `grade` | uma rodada tem essa nota de ritmo |
| `daysTrained` | `n` | o jogador treinou em `n` dias diferentes |
| `podiums` | `n` | o jogador subiu ao pódio em `n` corridas |
| `missions` | `n` | o jogador cumpriu `n` missões do dia |
| `freeRun` | `wpm`, `acc` | uma rodada de treino livre alcança essa velocidade e essa precisão |

## Textos

Os textos comuns da interface e os textos padrão de um tema ficam em `i18n/pt.json` e `i18n/en.json`. A interface usa a primeira língua do navegador que tenha textos em `i18n/`; em qualquer outra língua, ela fica em português. Os textos de `strings` do tema valem em todas as línguas. Os textos `passRule` e `raceRule` recebem a precisão exigida pelo engine em `{acc}` e, no `passRule`, a das corridas em `{raceAcc}`; o tema não escreve esses números. Uma chave que um tema define em `strings` precisa existir em `i18n/pt.json`, para que outro tema possa deixá-la de fora; o teste de temas confere isso.

## Testes

`just test` roda todos os testes. `tests/themes.test.js` joga o curso inteiro com cada tema de `themes/` e com o tema mínimo `tests/fixtures/minimal-theme.json`. Ele confere que cada etapa termina com a sua última lição, que a distância avança, que as etapas com rival viram corrida, que o fim mostra o slide de chegada e que nenhum nome de chave de texto aparece na tela. O snapshot (`tests/snapshot.txt`) usa o tema JoJo.
