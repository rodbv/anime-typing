# Steel Ball Type e Temples of Typing

Treino de digitação por toque em português, contado como uma história. O jogo tem duas versões, com o mesmo curso de 21 lições:

- **Steel Ball Type:** a corrida Steel Ball Run, de JoJo's Bizarre Adventure. O jogador é o Johnny Joestar, e cada lição concluída leva o cavalo dele de San Diego a Nova York. Jogue em https://rodbv.github.io/jojo-typing/
- **Temples of Typing:** a discografia do Rush. O jogador é o Starman do 2112, e cada lição é um disco, de Rush (1974) a Clockwork Angels (2012). Jogue em https://rodbv.github.io/jojo-typing/rush.html

## Como funciona

- **21 lições em etapas:** cada lição ensina uma ou duas teclas novas. Cada lição tem três partes: aquecimento nas teclas novas, palavras e uma mistura. Cada tema agrupa as lições em etapas.
- **Corridas:** nas etapas com rival, a última lição é uma corrida contra um personagem da história. O rival aparece como um cursor fantasma que digita no ritmo dele. A velocidade do rival acompanha a velocidade recente do jogador.
- **Missão diária:** cada dia propõe a próxima lição, uma revisão da tecla mais fraca e um treino livre ou uma frase.
- **Conquistas e Ficha:** as lições concluídas liberam conquistas e evoluem o personagem do jogador. A aba Ficha mostra um hexágono de atributos e a classificação nas corridas.
- **Compartilhar no Zap:** o botão na tela inicial mostra um QR code. No celular, o código abre um diário do dia com o progresso, as conquistas novas e a posição na jornada, e um botão manda o link pelo WhatsApp. Os dados ficam no próprio link, sem servidor.
- **Ajuda de teclado:** o teclado na tela aparece nas lições de tecla nova. Nas outras partes, a dica espera uma pausa ou um erro.

## Teclados

O app aceita três layouts: US Internacional (com teclas mortas para acentos), US e ABNT2. Na primeira vez, o app detecta o layout pela tecla à direita do L.

## Rodar localmente

O jogo carrega o tema e os textos com fetch, então precisa de um servidor. Com o [just](https://github.com/casey/just) instalado:

```
just run
```

Depois abra http://localhost:8000 (JoJo) ou http://localhost:8000/rush.html (Rush). Sem o just, `python3 -m http.server` na pasta faz a mesma coisa.

O progresso fica no localStorage do navegador, separado por endereço e por tema. O site publicado e o servidor local têm progressos diferentes.

O [ROTEIRO.md](ROTEIRO.md) descreve a história do tema JoJo, as etapas e as decisões de design.

## Estrutura

- `engine.js` e `engine.css`: o jogo, igual para todos os temas.
- `loader.js`: busca o tema e os textos e depois inicia o engine.
- `themes/jojo.json` e `themes/rush.json`: o conteúdo de cada tema.
- `i18n/pt.json` e `i18n/en.json`: os textos comuns da interface e os textos padrão de um tema.
- `index.html` e `rush.html`: as páginas de cada tema.
- `themes.json`: a lista de temas do seletor no topo da página.

O [TEMAS.md](TEMAS.md) explica como criar um tema novo.

## Testes

Os testes rodam no jsdom e precisam do Node:

```
just test
```

- `tests/themes.test.js` joga o curso inteiro com cada tema de `themes/` e com um tema mínimo de teste. Um tema novo entra nesse teste sem arquivo de teste próprio.
- `tests/snapshot.test.js` compara as telas principais do tema JoJo com `tests/snapshot.txt`. Se uma mudança altera uma tela de propósito, `just snapshot` grava o snapshot novo, e o diff mostra o que mudou.

## Aviso sobre direitos autorais

Este é um projeto de fã, pessoal e sem fins comerciais, feito para ensinar digitação a uma criança.

JoJo's Bizarre Adventure, Steel Ball Run, seus personagens, nomes, Stands e falas pertencem a Hirohiko Araki e à Shueisha. Este projeto não tem nenhuma ligação com eles, nem com a David Production ou com qualquer licenciado. As distâncias das etapas e as falas vêm da [JoJo Wiki](https://jojowiki.com/Steel_Ball_Run_(Race)).

Rush, os nomes dos discos e das músicas e as letras pertencem aos seus autores (Geddy Lee, Alex Lifeson e Neil Peart) e às suas gravadoras e editoras. Este projeto não tem nenhuma ligação com eles. O tema cita um único verso de cada música, sem capas de disco.

Se você detém direitos sobre esse material e quer que ele saia daqui, abra uma issue neste repositório. Eu retiro ou substituo o conteúdo.

## Licença

O código está sob a [licença MIT](LICENSE). O app inclui a biblioteca [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), de Kazuhiko Arase, também sob a licença MIT. A licença cobre só o código e o texto originais deste repositório. Ela não cobre o material de JoJo's Bizarre Adventure e do Rush citado acima.
