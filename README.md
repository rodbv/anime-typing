# Steel Ball Type

Treino de digitação por toque em português, contado como a corrida Steel Ball Run de JoJo's Bizarre Adventure. O jogador é o Johnny Joestar, e cada lição concluída leva o cavalo dele de San Diego a Nova York.

Jogue em https://rodbv.github.io/jojo-typing/

## Como funciona

- **21 lições em 9 etapas:** cada lição ensina uma ou duas teclas novas. Cada lição tem três partes: aquecimento nas teclas novas, palavras e uma mistura.
- **Corridas:** a última lição de cada etapa é uma corrida contra um rival da história. O rival aparece como um cursor fantasma que digita no ritmo dele. A velocidade do rival acompanha a velocidade recente do jogador.
- **Missão diária:** cada dia propõe a próxima lição, uma revisão da tecla mais fraca e um treino livre ou uma frase.
- **Conquistas e Ficha:** as lições concluídas liberam as partes do Cadáver Santo e os ACTs do Tusk. A aba Ficha mostra um hexágono de atributos e a classificação nas corridas.
- **Compartilhar no Zap:** o botão na tela inicial mostra um QR code. No celular, o código abre um diário do dia com o progresso, as conquistas novas e a posição na corrida, e um botão manda o link pelo WhatsApp. Os dados ficam no próprio link, sem servidor.
- **Ajuda de teclado:** o teclado na tela aparece nas lições de tecla nova. Nas outras partes, a dica espera uma pausa ou um erro.

## Teclados

O app aceita três layouts: US Internacional (com teclas mortas para acentos), US e ABNT2. Na primeira vez, o app detecta o layout pela tecla à direita do L.

## Rodar localmente

O jogo carrega o tema e os textos com fetch, então precisa de um servidor. Com o [just](https://github.com/casey/just) instalado:

```
just run
```

Depois abra http://localhost:8000. Sem o just, `python3 -m http.server` na pasta faz a mesma coisa.

O progresso fica no localStorage do navegador, separado por endereço e por tema. O site publicado e o servidor local têm progressos diferentes.

O [ROTEIRO.md](ROTEIRO.md) descreve a história, as etapas e as decisões de design.

## Estrutura

- `engine.js` e `engine.css`: o jogo, igual para todos os temas.
- `loader.js`: busca o tema e os textos e depois inicia o engine.
- `themes/jojo.json`: tudo o que é de Steel Ball Run.
- `i18n/pt.json` e `i18n/en.json`: os textos comuns da interface.
- `index.html`: a página do tema JoJo.

O [TEMAS.md](TEMAS.md) explica como criar um tema novo.

## Testes

Os testes rodam no jsdom e precisam do Node:

```
just test
```

Um dos testes compara as telas principais com `tests/snapshot.txt`. Se uma mudança altera uma tela de propósito, `just snapshot` grava o snapshot novo, e o diff mostra o que mudou.

## Aviso sobre direitos autorais

Este é um projeto de fã, pessoal e sem fins comerciais, feito para ensinar digitação a uma criança.

JoJo's Bizarre Adventure, Steel Ball Run, seus personagens, nomes, Stands e falas pertencem a Hirohiko Araki e à Shueisha. Este projeto não tem nenhuma ligação com eles, nem com a David Production ou com qualquer licenciado. As distâncias das etapas vêm da [JoJo Wiki](https://jojowiki.com/Steel_Ball_Run_(Race)).

Se você detém direitos sobre esse material e quer que ele saia daqui, abra uma issue neste repositório. Eu retiro ou substituo o conteúdo.

## Licença

O código está sob a [licença MIT](LICENSE). O app inclui a biblioteca [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), de Kazuhiko Arase, também sob a licença MIT. A licença cobre só o código e o texto originais deste repositório. Ela não cobre o material de JoJo's Bizarre Adventure citado acima.
