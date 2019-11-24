document.getElementById("content").innerHTML =
localStorage["text"] || "Digite seu codigo"; // default text
setInterval(function() {
  // fuction that is saving the innerHTML of the div
  localStorage["text"] = document.getElementById("content").innerHTML; // content div
}, 1000);

let palavrasReservadas = [
  { portuguese: /\benquanto\b/i, javascriptCode: 'while', color: '#800080', tooltip: 'Estrutura de repetição'},
  { portuguese: /\bpara\b/i, javascriptCode: 'for', color: '#800080' },
  { portuguese: /\bimprima\b/i, javascriptCode: 'alert', color: '#D7DF01', tooltip: 'Imprimir' },
  { portuguese: /\bsenao\b/i, javascriptCode: 'else', color: '#DF7401' },
  { portuguese: /\bse\b/i, javascriptCode: 'if', color: '#DF7401' },
  { portuguese: /\bsenaose\b/i, javascriptCode: 'else if', color: '#DF7401' },
  { portuguese: /\bretorno\b/i, javascriptCode: 'return', color: '#e3e' },
  { portuguese: /\bleia\b/i, javascriptCode: 'prompt("Digite o valor: ")', color: '#D7DF01' },
  { portuguese: /\btamanho\b/i, javascriptCode: 'length', color: '#e3e' },
  { portuguese: /\badicionar\b/i, javascriptCode: 'push', color: '#e3e' },
  { portuguese: /\b(variavel|variável)\b/i, javascriptCode: 'var', color: '#0404B4' },
  { portuguese: /\be\b/i, javascriptCode: '&&', color: '#4e4'},
  { portuguese: /\bou\b/i, javascriptCode: '||', color: '#4e4'}
];

let simbolosReservados = ['&lt;:<', '&gt;:>'];
let podeCompilar;
let erros = [];
let codigoJavasScript;
/////////////////////functions//////////////////////////////////

function convertTextToCode(texto) {
  palavrasReservadas.forEach(element => {
    texto = texto.replace(element.portuguese, element.javascriptCode);
  });
  return texto;
}

function verificarSintaxeDeAspas(linha) {
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
      erroDeCompilacao('Erro de sintaxe, aspas não fechada;')
    }
  } else {
    linha = linha.toLowerCase();
    linha = convertTextToCode(linha);
  }
  return linha
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

function erroDeCompilacao(mensagem) {
  erros.push('<span style="color: red">' + mensagem + '</span><br>');
  podeCompilar = false
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

function atualizar() {
  podeCompilar = true;
  erros = [];

  texto = localStorage['text'];
  console.log(localStorage['text'])
  let codigo;
  if (texto) {
    let arrTexto = texto.split(';');
    arrTexto.forEach((linha, index) => {
      arrTexto[index] = verificarSintaxeDeAspas(linha);
    });
    codigo = arrTexto.join(';\n');
    verificarSintaxeDeEscopo(codigo, '(', ')');
    verificarSintaxeDeEscopo(codigo, '{', '}');
    verificarSintaxeDeEscopo(codigo, '[', ']');
    codigo = indentarCodigo(codigo);
    codigoJavasScript = mudarCorDoCodigo(codigo);
    document.getElementById('codigoJs').innerHTML = codigoJavasScript;
    let codigoExecutavel = removerDivEEspacoParaTornarExecutavel(codigo);
    console.log(codigoExecutavel);
    if (podeCompilar) {
      try {
        eval(codigoExecutavel);
        erros.push('<span style="color: rgb(31, 177, 31);">Compilado com sucesso;</span><br>')
      } catch (e) {
        erroDeCompilacao('Comando(s) inválido(s);');
      }
    }
    gerarSaida();
  }
}

function removerDivEEspacoParaTornarExecutavel(codigo) {
  return codigo.split('<div>').join(' ').split('</div>').join(' ').split('&nbsp;').join('');
}

function indentarCodigo(codigo) {
  for (let i = 0; i < simbolosReservados.length; i++) {
    let parte = simbolosReservados[i].split(":");
      codigo = codigo.replace(parte[0], parte[1]);    
  }
  return codigo;
}

function gerarSaida() {
  let consoleErro = document.getElementById('console-erro');
  let errosHTML = erros.join(' ');
  consoleErro.innerHTML = errosHTML;
}

function mudarCorDoCodigo(codigoJavasScript) {
  for (let i = 0; i < palavrasReservadas.length; i++) {
    codigoJavasScript = codigoJavasScript.replace(palavrasReservadas[i].javascriptCode, '<span data-toggle="tooltip" data-placement="left" title="'+ palavrasReservadas[i].tooltip +'" style="color:' 
      + palavrasReservadas[i].color + '">' + palavrasReservadas[i].javascriptCode + '</span>');
  }
  return codigoJavasScript
}

function mudarCorDoTexto(texto){
  for(let i = 0; i < palavrasReservadas.length; i++) {
    texto = texto.replace(palavrasReservadas[i].portuguese, '<span style="color:' 
    + palavrasReservadas[i].color + '">' + palavrasReservadas[i].portuguese + '</span>');
  }
}
