

String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
} //função replaceAll para toda string

let palavrasReservadas = [
  { portuguese: /\benquanto\b/, javascriptCode: 'while', color: '#800080', tooltip: 'Estrutura de repetição' },
  { portuguese: /\bpara\b/i, javascriptCode: 'for', color: '#800080', tooltip: 'Estrutura de repetição' },
  { portuguese: /\bimprima\b/, javascriptCode: 'alert', color: '#D7DF01', tooltip: 'Imprimir' },
  { portuguese: /\bleiaNumero\b/, javascriptCode: 'Number.parseFloat(prompt())', color: '#D7DF01', tooltip: 'Lê o valor digitado pelo usuário' },
  { portuguese: /\bleiaTexto\b/, javascriptCode: 'prompt()', color: '#D7DF01', tooltip: 'Lê o valor digitado pelo usuário' },

  { portuguese: /\bsenao\b/, javascriptCode: 'else', color: '#DF7401', tooltip: 'Condicional' },
  { portuguese: /\bse\b/, javascriptCode: 'if', color: '#DF7401', tooltip: 'Condicional' },
  { portuguese: /\bsenaose\b/, javascriptCode: 'else if', color: '#DF7401', tooltip: 'Condicional' },

  { portuguese: /\bretorno\b/, javascriptCode: 'return', color: '#e3e', tooltip: 'Retorna o valor' },

  { portuguese: /\b.tamanho\b/, javascriptCode: '.length', color: '#e3e', tooltip: 'Retorna o tamanho do array' },
  { portuguese: /\b.adicionar\b/, javascriptCode: '.push', color: '#e3e', tooltip: 'Adiciona um elemento a um array' },

  { portuguese: /\b(variavel|variável)\b/, javascriptCode: 'var', color: '#0404B4', tooltip: 'Notação para se declarar uma variavél' },

  { portuguese: /\be\b/, javascriptCode: '&&' },
  { portuguese: /\bou\b/, javascriptCode: '||' },

  { portuguese: /\bfuncao\b/i, javascriptCode: 'function', color: '#0404B4', tooltip: 'Declaração de um função' }
];

let simbolosReservados = ['&lt;:<', '&gt;:>'];
let podeCompilar;
let codigoJavasScript;
let entradaHtml = document.getElementById('entrada');
let entradaNumerosLateralHtml = document.getElementById('entrada-numeros-lateral')
let saidaHtml = document.getElementById('saida');
let consoleHtml = document.getElementById('console');
let saida;

entradaHtml.innerHTML = '<div>imprima("Digite o seu código!!");</div>'; //texto default

function compilar() {
  saida = [];
  podeCompilar = true;
  let texto = entradaHtml.innerHTML;
  let codigo;
  if (texto) {
    let arrTexto = texto.split('<div>');
    arrTexto.forEach((linha, index) => {
      arrTexto[index] = verificarSintaxeDeAspas(linha, index);
      validarVariavelTemNomeValidoJavascript(linha, index);
    });
    codigo = arrTexto.join('<div>');
    codigo = codigo.split('<span style="background-color: rgb(82, 82, 82);">').join('').split('</span>').join('');
    verificarSintaxeDeEscopo(codigo, '(', ')');
    verificarSintaxeDeEscopo(codigo, '{', '}');
    verificarSintaxeDeEscopo(codigo, '[', ']');
    codigoJavasScript = mudarCorDoCodigo(codigo);
    codigo = mudarSimbolosReservados(codigo);
    saidaHtml.innerHTML = codigoJavasScript;
    let codigoExecutavel = removerDivEEspacoParaTornarExecutavel(codigo);
    if (podeCompilar) {
      try {
        codigoExecutavel = 'function execute() {' + codigoExecutavel + '}';
        eval(codigoExecutavel)
        retorno = execute();
        console.log(retorno);
        saida.push('<span style="color: rgb(31, 177, 31);">Compilado com sucesso;</span><br>')
      } catch (e) {
        erroDeCompilacao('Comando(s) inválido(s);');
      }
    }
    gerarSaida();
  }
}

function convertTextToCode(texto) {
  palavrasInteiras = texto.split(' ');
  palavrasInteiras.forEach((palavra, index) => {
    palavrasReservadas.forEach(element => {
      palavrasInteiras[index] = palavrasInteiras[index].replace(element.portuguese, element.javascriptCode);
    });
  });
  texto = palavrasInteiras.join(' ');
  return texto;
}

function verificarSintaxeDeAspas(linha, nLinha) {
  if (linha.includes('"')) { //verificar se existe "" no elemento
    let contAspas = contarElementos(linha, '"');
    if (contAspas % 2 === 0) {
      let partes = linha.split('"');
      partes.forEach((parte, index) => {
        if (index % 2 === 0) {
          partes[index] = convertTextToCode(partes[index]);
        }
      });
      linha = partes.join('"');
    } else {
      erroDeCompilacao('Erro de sintaxe, aspas não fechada na linha: ' + (nLinha));
    }
  } else {
    linha = convertTextToCode(linha);
  }
  return linha;
}

function verificarSintaxeDeEscopo(codigo, aberturaDoEscopo, fechamentoDoEscopo) {
  if (codigo.includes(aberturaDoEscopo)) { //verificar se existe "" no elemento
    let contAberturaDoEscopo = contarElementos(codigo, aberturaDoEscopo);
    if (codigo.includes(fechamentoDoEscopo)) {
      let contFechamentoDoEscopo = contarElementos(codigo, fechamentoDoEscopo);
      if (contAberturaDoEscopo === contFechamentoDoEscopo) {
        return true;
      } else {
        erroDeCompilacao('Erro de sintaxe, esperava-se encontrar "' + fechamentoDoEscopo + '" ao fim do escopo;');
      }
    } else {
      erroDeCompilacao('Erro de sintaxe, esperava-se encontrar "' + fechamentoDoEscopo + '" ao fim do escopo;');
    }
  }
  return false;
}

function contarElementos(linha, elemento) {
  let inicio = 0;
  let contador = 0;
  while (linha.indexOf(elemento, inicio) > 0) {
    inicio = linha.indexOf(elemento, inicio) + 1;
    contador++;
  }
  return contador;
}

function validarVariavelTemNomeValidoJavascript(linha, nLinha) {
  if (linha) {
    let comandos = linha.split(';').join().split('; ').join().split('</div>').join().split(',');
    let partes = [];
    comandos.forEach(comando => {
      partes.push(comando.split(' ').join().split('=').join().split('()').join().split('&nbsp;').join().split(','));
    });
    let regExVariavel = /(variavel|function|var|funcao)/
    let regExSpecial = /[a-z]/i;
    partes.forEach(parte => {
      if (regExVariavel.test(parte[0])) {
        if (regExSpecial.test(parte[1].charAt(0))) {
          palavrasReservadas.forEach(palavra => {
            if (partes[1] === palavra.javascriptCode || palavra.portuguese.test(parte[1])) {
              erroDeCompilacao('O nome ' + parte[1] + ' é uma palavra reservada! Linha: ' + nLinha);
            }
          });
        } else {
          erroDeCompilacao('A ' + (parte[0] === 'var' ? ('variável "' + parte[1]) : ('função "' + parte[1] + '( )'))
            + '" deve se iniciar com uma letra! Linha: ' + nLinha + ', caracter errado: "'
            + parte[1].charAt(0) + '".');
        }
      }
    });
  }
}

function mudarSimbolosReservados(codigo) {
  for (let i = 0; i < simbolosReservados.length; i++) {
    let parte = simbolosReservados[i].split(":");
    codigo = codigo.replaceAll(parte[0], parte[1]);
  }
  return codigo;
}

function erroDeCompilacao(mensagem) {
  saida.push('<span style="color: red">' + mensagem + '</span><br>');
  podeCompilar = false
}

function removerDivEEspacoParaTornarExecutavel(codigo) {
  return codigo.split('<div>').join(' ').split('</div>').join(' ').split('&nbsp;').join('').split('<br>').join('');
}

function gerarSaida() {
  let saidaHTML = saida.join(' ');
  consoleHtml.innerHTML = saidaHTML;
}

function onKeyDown(e) {
  if (e.keyCode === 9) { // tab key
    e.preventDefault();  // this will prevent us from tabbing out of the editor

    // now insert four non-breaking spaces for the tab key
    var doc = entradaHtml.ownerDocument.defaultView;
    var sel = doc.getSelection();
    var range = sel.getRangeAt(0);

    var tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
    range.insertNode(tabNode);

    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function onScrollContent() {
  entradaNumerosLateralHtml.scrollTop = entradaHtml.scrollTop;
}

function selecionarLinha(e) {
  let entrada = document.querySelectorAll('#entrada div');
  if (entrada.length !== 0) {
    let arr = [];
    entrada.forEach((element, index) => {
      arr.push('<div style="height: ' + element.clientHeight + 'px">' + (index + 1) + '</div>');
    });
    entradaNumerosLateralHtml.innerHTML = arr.join(' ');
  } else {
    entradaHtml.innerHTML = '<div>&nbsp;</div>'
    entradaNumerosLateralHtml.innerHTML = '<div>1</div>';
  }
}

selecionarLinha();

function mudarCorDoCodigo(codigoJavasScript) {
  for (let i = 0; i < palavrasReservadas.length; i++) {
    if (palavrasReservadas[i].javascriptCode !== '||') {
      let regexp = new RegExp('\\b' + palavrasReservadas[i].javascriptCode + '\\b', 'ig');
      codigoJavasScript = codigoJavasScript.replace(regexp, '<span data-toggle="tooltip" data-placement="left" title="' + palavrasReservadas[i].tooltip + '" style="color:'
        + palavrasReservadas[i].color + '">' + palavrasReservadas[i].javascriptCode + '</span>');
    }
  }
  return codigoJavasScript;
}

// function mudarCorDoTexto() { //com defeito
//   for (let i = 0; i < palavrasReservadas.length; i++) {
//     texto = texto.replaceAll(palavrasReservadas[i].portuguese, '<span style="color:'
//       + palavrasReservadas[i].color + '">' + palavrasReservadas[i].portuguese + '</span>');
//   }
// }


