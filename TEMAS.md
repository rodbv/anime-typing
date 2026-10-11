# Como criar um tema

Um tema é um arquivo JSON em `themes/`, com todo o conteúdo de uma história: etapas, rivais, falas, conquistas, cores e textos. O engine (`engine.js`) traz o curso de 21 lições, a digitação e as regras do jogo, e é igual para todos os temas. O tema JoJo (`themes/jojo.json`) serve de exemplo completo.

## Passo a passo

1. Copie `themes/jojo.json` para `themes/<nome>.json` e troque o conteúdo.
2. Copie `index.html` para `<nome>.html`. Troque o `<title>`, as og:meta e o `data-theme` do loader:

   ```
   <script src="loader.js?v=2" data-i18n="i18n/pt.json i18n/en.json" data-theme="themes/<nome>.json"></script>
   ```

3. Rode `just run` e abra `http://localhost:8000/<nome>.html`.

Se o tema tiver um erro de estrutura, como uma lição que não existe ou um rival sem cadastro, a página mostra a lista de problemas em vez do jogo.

## Chaves do tema

| Chave | O que é |
|---|---|
| `id` | nome curto do tema |
| `lang` | língua da interface: `"pt"` ou `"en"` |
| `storeKey` | chave do progresso no localStorage. Cada tema precisa de uma chave própria. |
| `siteUrl` | endereço publicado da página. O QR code usa esse endereço quando o jogo roda fora de um servidor http. |
| `look` | `logo` (duas partes; a segunda aparece em destaque), `deco` (texto grande decorativo no fundo) e `colors` (`bg`, `panel`, `panel2`, `line`, `text`, `muted`, `accent`, `accent2`) |
| `strings` | textos da história. Uma chave com o mesmo nome de uma chave de `i18n/` substitui o texto comum. |
| `hero` | o personagem do jogador: `name`, `short` (nome curto), `number` (número de corredor) e `icon` |
| `mentor` | quem dá as dicas: `name` |
| `words` | `names` e `terms`, palavras separadas por espaço que entram nas lições |
| `quotes` | frases para digitar, cada uma como `[texto, autor]` |
| `journey` | a jornada: `unit` (unidade de distância), `marker` (ícone no mapa), `start` e `stages` |
| `rivals` | os rivais das corridas, por id |
| `story` | narração por lição: `{"<id da lição>": {"narr": "...", "mentor": "..."}}` |
| `evolution` | o que evolui com o jogador: `name` e `levels`, cada nível com `label` e a `lesson` que o libera |
| `prologue` | a história de abertura: `slides` e `where` |
| `achievements` | as conquistas |
| `ranks` | patentes por velocidade: `[ppm mínimo, nome em inglês, nome em português]` |

### Etapas (`journey.stages`)

```
{"lbl": "Etapa 1", "place": "Praia de San Diego", "from": "San Diego", "to": "Igreja Santa Maria Novella",
 "dist": 15, "pt": [76, 222], "label": "Monument Valley", "dy": 22, "lessons": ["fj", "dk"], "rival": "sandman"}
```

- **`lessons`:** as lições da etapa. Juntas, as etapas precisam cobrir as 21 lições do curso, na ordem do curso.
- **`rival`:** opcional. A última lição de uma etapa com rival vira uma corrida contra ele.
- **`dist`:** o tamanho da etapa na unidade de `journey.unit`. Cada lição concluída avança uma fração da etapa.
- **`pt`, `label` e `dy`:** posição no mapa, rótulo e ajuste vertical do rótulo. O mapa usa a área `20 30 600 230` do SVG. `journey.start` usa os mesmos campos para o ponto de partida.

As lições do curso, em ordem: `fj dk sl a gh r1 ei ru to nm c, qp r2 acc1 acc2 vb x. zwy r3 shift quotes`.

### Rivais (`rivals`)

```
"diego": {"nm": "Diego Brando", "no": "001", "floor": 8, "pre": "...", "win": "...", "lose": "..."}
```

- **`floor`:** velocidade mínima do fantasma, em PPM. O fantasma corre 10% acima da média recente do jogador, ou 20% se `boss` for `true`.
- **`pre`, `win` e `lose`:** a fala antes da corrida, a frase de vitória e a frase de derrota.
- **`no`:** opcional, o número de corredor do rival.

### Abertura (`prologue`)

- **`slides`:** cada slide tem `art` (um emoji, `"map"` para o mapa ou `"hands"` para as mãos no teclado), `title`, `narr` (lista de parágrafos) e `mentor` (opcional).
- **`where`:** o último slide, que mostra onde o jogador está. Ele tem três formas:
  - `start` antes da primeira lição;
  - `finished` depois da última;
  - `progress` no meio do caminho.

  Os textos aceitam estes marcadores: `{lbl}`, `{place}`, `{from}`, `{to}`, `{dist}`, `{total}`, `{n}`, `{lesson}`, `{rival}` e `{done}`.

### Conquistas (`achievements`)

```
{"id": "ball", "s": "race", "ic": "⚪", "nm": "Bola de aço", "d": "Termine a etapa 1", "when": {"type": "stageCleared", "stage": 0}}
```

`s` é o grupo da conquista. O nome de cada grupo fica em `strings.collGroups`, por exemplo `{"race": "Partes do Cadáver Santo"}`. `when` diz quando a conquista é liberada:

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

Os textos comuns da interface ficam em `i18n/pt.json` e `i18n/en.json`. Se uma chave não existir na língua do tema, o engine usa o texto em português.

O tema precisa definir em `strings` os textos de história que o engine lê. Para ver a lista, abra `strings` em `themes/jojo.json`. Uma chave que falta aparece na tela com o próprio nome, como `cardTitle`.

## Testes

`just test` roda os testes com o tema JoJo. O snapshot (`tests/snapshot.txt`) também usa esse tema. Para testar outro tema, rode o jogo com `just run` e abra a página do tema.
