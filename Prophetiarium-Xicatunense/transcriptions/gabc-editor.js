/**
 * Editor básico para criar e modificar arquivos GABC
 * Esta ferramenta permite criar e editar arquivos no formato GABC (Gregorio ASCII)
 */

class GabcEditor {
  constructor() {
    this.header = {
      name: '',
      office_part: '',
      mode: '',
      book: '',
      transcriber: '',
      commentary: ''
    };
    
    this.body = '';
    this.filename = '';
  }

  // Define o cabeçalho do arquivo GABC
  setHeader(headerObj) {
    this.header = { ...this.header, ...headerObj };
  }

  // Define o corpo da melodia GABC
  setBody(body) {
    this.body = body;
  }

  // Define o nome do arquivo
  setFilename(filename) {
    this.filename = filename;
  }

  // Gera o conteúdo completo do arquivo GABC
  generateGabcContent() {
    const headerLines = [
      `name: ${this.header.name};`,
      `office-part: ${this.header.office_part};`,
      `mode: ${this.header.mode};`,
      `book: ${this.header.book};`,
      `transcriber: ${this.header.transcriber};`,
      `commentary: ${this.header.commentary};`,
      '%%',
      this.body
    ].filter(line => line !== undefined && line !== '');
    
    return headerLines.join('\n');
  }

  // Valida se o formato GABC está correto
  validateSyntax() {
    const errors = [];
    
    // Verifica campos obrigatórios
    if (!this.header.name) errors.push("Nome é obrigatório");
    if (!this.header.mode) errors.push("Modo é obrigatório");
    if (!this.body) errors.push("Corpo da melodia é obrigatório");
    
    // Verifica se há pelo menos um %% antes do conteúdo da melodia
    if (!this.body.includes('%%')) {
      errors.push("Conteúdo deve começar após %%");
    }
    
    // Verifica se há algum conteúdo de melodia válido
    if (this.body && !/[a-z]/.test(this.body)) {
      errors.push("Corpo da melodia deve conter notas válidas");
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Salva o arquivo GABC
  async saveToFile() {
    const validationResult = this.validateSyntax();
    
    if (!validationResult.isValid) {
      throw new Error(`Erros de validação: ${validationResult.errors.join(', ')}`);
    }
    
    const content = this.generateGabcContent();
    
    // Em um ambiente Node.js, salvaríamos o arquivo
    // Aqui estamos retornando o conteúdo para que outro componente possa salvar
    return {
      filename: this.filename || `${this.header.name.replace(/\s+/g, '_')}.gabc`,
      content: content
    };
  }

  // Carrega um arquivo GABC existente
  static async loadFromFile(content) {
    const lines = content.split('\n');
    const editor = new GabcEditor();
    
    let inHeader = true;
    let bodyLines = [];
    
    for (const line of lines) {
      if (line.trim() === '%%') {
        inHeader = false;
        continue;
      }
      
      if (inHeader) {
        const match = line.match(/^([a-z-]+):\s*(.+);$/);
        if (match) {
          const field = match[1].replace('-', '_');
          const value = match[2];
          
          switch (field) {
            case 'name':
              editor.header.name = value;
              break;
            case 'office_part':
              editor.header.office_part = value;
              break;
            case 'mode':
              editor.header.mode = value;
              break;
            case 'book':
              editor.header.book = value;
              break;
            case 'transcriber':
              editor.header.transcriber = value;
              break;
            case 'commentary':
              editor.header.commentary = value;
              break;
          }
        }
      } else {
        bodyLines.push(line);
      }
    }
    
    editor.setBody(bodyLines.join('\n'));
    return editor;
  }

  // Aplica modificações a uma melodia existente
  modifyMelody(changes) {
    // Permite modificar partes específicas da melodia
    // changes pode conter alterações nas notas, adição de palavras, etc.
    if (changes.notes) {
      // Substitui notas na melodia
      this.body = this.body.replace(/[\w()\/\\+*={}~\-.,:;'"?!@#$%^&<>[\]]+/g, (match) => {
        // Implementação simplificada - substituições mais específicas podem ser necessárias
        return changes.notes[match] || match;
      });
    }
    
    if (changes.lyrics) {
      // Modifica letras da melodia
      // Esta implementação depende da estrutura específica do GABC
      for (const [original, replacement] of Object.entries(changes.lyrics)) {
        this.body = this.body.replace(new RegExp(original, 'g'), replacement);
      }
    }
  }
}

// Exporta a classe para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GabcEditor;
}

// Exemplo de uso:
/*
const editor = new GabcEditor();
editor.setHeader({
  name: "Exemplo de melodia",
  office_part: "Introito",
  mode: "1",
  book: "Liber Usualis",
  transcriber: "Subagente GABC",
  commentary: "Exemplo para demonstracao"
});
editor.setBody("%%\n(c3) Ex(gh)em(h)plum(h) *(;) Dó(h)mi(h)nus(h) *(;) Ju(h)di(h)cá(h)vit(h) me.(h)");
editor.setFilename("exemplo.gabc");

console.log(editor.generateGabcContent());
*/