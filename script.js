
document.getElementById('content').innerHTML = '<div>imprima("Digite o seu código!!");</div>'; //texto default

String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
} //função replaceAll para toda string

let palavrasReservadas = [
  { portuguese: /\benquanto\b/i, javascriptCode: 'while', color: '#800080', tooltip: 'Estrutura de repetição' },
  { portuguese: /\bpara\b/i, javascriptCode: 'for', color: '#800080', tooltip: 'Estrutura de repetição' },

  { portuguese: /\bimprima\b/i, javascriptCode: 'alert', color: '#D7DF01', tooltip: 'Imprimir' },
  { portuguese: /\bleia\b/i, javascriptCode: 'prompt', color: '#D7DF01', tooltip: 'Lê o valor digitado pelo usuário' },

  { portuguese: /\bsenao\b/i, javascriptCode: 'else', color: '#DF7401', tooltip: 'Condicional' },
  { portuguese: /\bse\b/i, javascriptCode: 'if', color: '#DF7401', tooltip: 'Condicional' },
  { portuguese: /\bsenaose\b/i, javascriptCode: 'else if', color: '#DF7401', tooltip: 'Condicional' },

  { portuguese: /\bretorno\b/i, javascriptCode: 'return', color: '#e3e', tooltip: 'Retorna o valor' },

  { portuguese: /\btamanho\b/i, javascriptCode: 'length', color: '#e3e', tooltip: 'Retorna o tamanho do array' },
  { portuguese: /\badicionar\b/i, javascriptCode: 'push', color: '#e3e', tooltip: 'Adiciona um elemento a um array' },

  { portuguese: /\b(variavel|variável)\b/i, javascriptCode: 'var', color: '#0404B4', tooltip: 'Notação para se declarar uma variavél' },

  { portuguese: /\be\b/i, javascriptCode: '&&' },
  { portuguese: /\bou\b/i, javascriptCode: '||' },

  { portuguese: /\bfuncao\b/i, javascriptCode: 'function',  color: '#0404B4', tooltip: 'Declaração de um função'}
];

let simbolosReservados = ['&lt;:<', '&gt;:>'];
let podeCompilar;
let erros = [];
let codigoJavasScript;

function compilar() {
  podeCompilar = true;
  erros = [];

  let texto = document.getElementById("content").innerHTML;
  let codigo;
  if (texto) {
    let arrTexto = texto.split('<div>');
    arrTexto.forEach((linha, index) => {
      arrTexto[index] = verificarSintaxeDeAspas(linha, index);
    });
    codigo = arrTexto.join('<div>');
    verificarSintaxeDeEscopo(codigo, '(', ')');
    verificarSintaxeDeEscopo(codigo, '{', '}');
    verificarSintaxeDeEscopo(codigo, '[', ']');
    codigoJavasScript = mudarCorDoCodigo(codigo);
    codigo = mudarSimbolosReservados(codigo);
    document.getElementById('codigoJs').innerHTML = codigoJavasScript;
    let codigoExecutavel = removerDivEEspacoParaTornarExecutavel(codigo);
    if (podeCompilar) {
      try {
        codigoExecutavel = 'function execute() {' + codigoExecutavel + '}';
        eval(codigoExecutavel)
        retorno = execute();
        console.log(retorno);
        erros.push('<span style="color: rgb(31, 177, 31);">Compilado com sucesso;</span><br>')
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
          partes[index] = parte.toLowerCase();
          partes[index] = convertTextToCode(partes[index]);
        }
      });
      linha = partes.join('"');
    } else {
      erroDeCompilacao('Erro de sintaxe, aspas não fechada na linha: ' + (nLinha));
    }
  } else {
    linha = linha.toLowerCase();
    linha = convertTextToCode(linha);
  }
  validarVariavelComNomeReservadoJavascript(linha, nLinha);

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

function validarVariavelComNomeReservadoJavascript(linha, nLinha) {
  let partes = linha.split(' ').join().split(';').join().split('</div>').join('').split('=').join().split(',');
  if (partes[0] === 'var') {
    palavrasReservadas.forEach(palavra => {
      if (partes[1] === palavra.javascriptCode) {
        erroDeCompilacao('O nome ' + palavra.javascriptCode + ' é uma palavra reservada! Linha: ' + nLinha);
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
  erros.push('<span style="color: red">' + mensagem + '</span><br>');
  podeCompilar = false
}

function removerDivEEspacoParaTornarExecutavel(codigo) {
  return codigo.split('<div>').join(' ').split('</div>').join(' ').split('&nbsp;').join('').split('<br>').join('');
}

function gerarSaida() {
  let consoleErro = document.getElementById('console-erro');
  let errosHTML = erros.join(' ');
  consoleErro.innerHTML = errosHTML;
}

function onKeyDown(e) {
  if (e.keyCode === 9) { // tab key
    e.preventDefault();  // this will prevent us from tabbing out of the editor

    // now insert four non-breaking spaces for the tab key
    var editor = document.getElementById("content");
    var doc = editor.ownerDocument.defaultView;
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
  var content = document.getElementById("content");
  var contentLateral = document.getElementById("content-lateral");
  contentLateral.scrollTop = content.scrollTop;
}

function selecionarLinha(e) {
  let content = document.querySelectorAll('#content div');
  if (content.length !== 0) {
    let arr = [];
    content.forEach((element, index) => {
      arr.push('<div style="height: ' + element.clientHeight + 'px">' + (index + 1) + '</div>');
    });
    document.getElementById('content-lateral').innerHTML = arr.join(' ');
  } else {
    document.getElementById('content').innerHTML = '<div>&nbsp;</div>'
    document.getElementById('content-lateral').innerHTML = '<div>1</div>';
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

function mudarCorDoTexto() { //com defeito
  for (let i = 0; i < palavrasReservadas.length; i++) {
    texto = texto.replaceAll(palavrasReservadas[i].portuguese, '<span style="color:'
      + palavrasReservadas[i].color + '">' + palavrasReservadas[i].portuguese + '</span>');
  }
}


