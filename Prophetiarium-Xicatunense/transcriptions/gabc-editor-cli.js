#!/usr/bin/env node

/**
 * Interface de linha de comando para o editor GABC
 * Permite criar e modificar arquivos GABC diretamente pelo terminal
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const GabcEditor = require('./gabc-editor.js');

// Cria interface de leitura para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createNewGabc() {
  console.log("Criando um novo arquivo GABC...");
  
  const name = await askQuestion("Nome da melodia: ");
  const officePart = await askQuestion("Parte liturgica (Introito, Gradual, etc.): ");
  const mode = await askQuestion("Modo (1-8): ");
  const book = await askQuestion("Livro de origem: ");
  const transcriber = await askQuestion("Transcritor: ");
  const commentary = await askQuestion("Comentario (opcional): ");
  const body = await askQuestion("Corpo da melodia (conteúdo GABC): ");
  
  const editor = new GabcEditor();
  editor.setHeader({
    name,
    office_part: officePart,
    mode,
    book,
    transcriber,
    commentary
  });
  editor.setBody(body);
  
  try {
    const result = await editor.saveToFile();
    
    // Garante que o diretório existe
    const dirPath = path.dirname(result.filename);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(result.filename, result.content);
    console.log(`Arquivo GABC salvo com sucesso: ${result.filename}`);
  } catch (error) {
    console.error("Erro ao salvar arquivo:", error.message);
  }
}

async function modifyExistingGabc() {
  const filePath = await askQuestion("Caminho do arquivo GABC a ser modificado: ");
  
  if (!fs.existsSync(filePath)) {
    console.error("Arquivo não encontrado!");
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const editor = await GabcEditor.loadFromFile(content);
  
  console.log("Editar melodia existente:");
  console.log(`Nome: ${editor.header.name}`);
  console.log(`Parte liturgica: ${editor.header.office_part}`);
  console.log(`Modo: ${editor.header.mode}`);
  
  const newName = await askQuestion(`Novo nome (pressione Enter para manter "${editor.header.name}"): `);
  const newOfficePart = await askQuestion(`Nova parte liturgica (pressione Enter para manter "${editor.header.office_part}"): `);
  const newMode = await askQuestion(`Novo modo (pressione Enter para manter "${editor.header.mode}"): `);
  const newBody = await askQuestion(`Novo corpo da melodia (pressione Enter para manter atual):\n${editor.body}\n`);
  
  if (newName) editor.header.name = newName;
  if (newOfficePart) editor.header.office_part = newOfficePart;
  if (newMode) editor.header.mode = newMode;
  if (newBody) editor.body = newBody;
  
  try {
    const result = await editor.saveToFile();
    
    fs.writeFileSync(filePath, result.content);
    console.log(`Arquivo GABC atualizado com sucesso: ${filePath}`);
  } catch (error) {
    console.error("Erro ao salvar arquivo:", error.message);
  }
}

async function main() {
  console.log("Editor GABC - Interface de Linha de Comando");
  console.log("1. Criar novo arquivo GABC");
  console.log("2. Modificar arquivo GABC existente");
  
  const option = await askQuestion("Escolha uma opção (1 ou 2): ");
  
  if (option === '1') {
    await createNewGabc();
  } else if (option === '2') {
    await modifyExistingGabc();
  } else {
    console.log("Opção inválida!");
  }
  
  rl.close();
}

// Executa a função principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { GabcEditor, createNewGabc, modifyExistingGabc };