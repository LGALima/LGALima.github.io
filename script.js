// let portuguesToCodeWords = [
//   'enquanto:while',
//   'para:for',
//   'imprima:alert',
//   'senao:else', 'se:if',
//   'retorno:return',
//   'leia:prompt("Digite o valor da variavel ")',
//   'tamanho:length', 'adicionar:push'
// ];

let portuguesToCodeWords = [
  { portuguese: /\benquanto\b/i , javascriptCode: 'while' },
  { portuguese: /\bpara\b/i , javascriptCode: 'for' },
  { portuguese: /\bimprima\b/i, javascriptCode: 'alert' },
  { portuguese: /\bsenao\b/i, javascriptCode: 'else' },
  { portuguese: /\bse\b/i, javascriptCode: 'if' },
  { portuguese: /\bretorno\b/i, javascriptCode: 'return' },
  { portuguese: /\bleia\b/i, javascriptCode: 'prompt("Digite o valor da variavel ")' },
  { portuguese: /\btamanho\b/i, javascriptCode: 'length' },
  { portuguese: /\badicionar\b/i, javascriptCode: 'push' },
  { portuguese: /\b(variavel|variável)\b/i, javascriptCode: 'var'}
];

let indentacaoToCode = [';:;<br>', '{:{<br>', '}:<br>}<br>'];
let podeCompilar;
let erros = [];
let codigoIndentado;
/////////////////////functions

function convertTextToCode(texto) {
  portuguesToCodeWords.forEach(element => {
    if (texto.replace(element.portuguese , element.javascriptCode) !== undefined) {
      texto = texto.replace(element.portuguese, element.javascriptCode);
    }
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

  texto = document.getElementById('codigo').value;
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
    indentarCodigo(codigo);
    document.getElementById('codigoJs').innerHTML = codigoIndentado;
    if (podeCompilar) {
      try {
        eval(codigo);
        erros.push('<span style="color: rgb(31, 177, 31);">Compilado com sucesso;</span><br>')
      } catch (e) {
        erroDeCompilacao('Comando(s) inválido(s);');
      }
    }
    gerarSaida();
  }
}

function indentarCodigo(codigo){
  // indentacaoToCode.forEach(element => {
  //   let parte = element.split(":");
  //   console.log(parte);
  //   codigoIndentado = codigo.replace(parte[0], parte[1]);
  // });

  for(let i = 0; i < indentacaoToCode.length; i++) {
    let parte = indentacaoToCode[i].split(":");
    codigoIndentado = codigo.replace(parte[0], parte[1]);
    console.log(codigoIndentado)
  }
}

function gerarSaida() {
  let consoleErro = document.getElementById('console-erro');
  let errosHTML = erros.join(' ');
  consoleErro.innerHTML = errosHTML;
}

