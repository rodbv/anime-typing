# Steel Ball Type

Treino de digitação por toque em português, contado como a corrida Steel Ball Run de JoJo's Bizarre Adventure. O jogador é o Johnny Joestar, e cada lição concluída leva o cavalo dele de San Diego a Nova York.

Jogue em https://rodbv.github.io/anime-typing/

## Como funciona

- **21 lições em 9 etapas:** cada lição ensina uma ou duas teclas novas. Cada lição tem três partes: aquecimento nas teclas novas, palavras e uma mistura.
- **Corridas:** a última lição de cada etapa é uma corrida contra um rival da história. O rival aparece como um cursor fantasma que digita no ritmo dele. A velocidade do rival acompanha a velocidade recente do jogador.
- **Missão diária:** cada dia propõe a próxima lição, uma revisão da tecla mais fraca e um treino livre ou uma frase.
- **Coleção e Ficha:** as lições concluídas liberam as partes do Cadáver Santo e os ACTs do Tusk. A aba Ficha mostra um hexágono de atributos e a classificação nas corridas.
- **Ajuda de teclado:** o teclado na tela aparece nas lições de tecla nova. Nas outras partes, a dica espera uma pausa ou um erro.

## Teclados

O app aceita três layouts: US Internacional (com teclas mortas para acentos), US e ABNT2. Na primeira vez, o app detecta o layout pela tecla à direita do L.

## Rodar localmente

O app é um único arquivo HTML, sem dependências e sem servidor. Abra o `index.html` no navegador.

O progresso fica no localStorage do navegador. O navegador guarda esse progresso separado por endereço, então o arquivo local e o site publicado têm progressos diferentes. Se o arquivo mudar de pasta ou de nome, o progresso local some.

O [ROTEIRO.md](ROTEIRO.md) descreve a história, as etapas e as decisões de design.

## Aviso sobre direitos autorais

Este é um projeto de fã, pessoal e sem fins comerciais, feito para ensinar digitação a uma criança.

JoJo's Bizarre Adventure, Steel Ball Run, seus personagens, nomes, Stands e falas pertencem a Hirohiko Araki e à Shueisha. Este projeto não tem nenhuma ligação com eles, nem com a David Production ou com qualquer licenciado. As distâncias das etapas vêm da [JoJo Wiki](https://jojowiki.com/Steel_Ball_Run_(Race)).

Se você detém direitos sobre esse material e quer que ele saia daqui, abra uma issue neste repositório. Eu retiro ou substituo o conteúdo.

## Licença

O código está sob a [licença MIT](LICENSE). A licença cobre só o código e o texto originais deste repositório. Ela não cobre o material de JoJo's Bizarre Adventure citado acima.
