# Editor GABC

Editor básico para criar e modificar arquivos GABC (Gregorio ASCII) para canto gregoriano.

## Descrição

Esta ferramenta permite criar e editar arquivos no formato GABC, que é um formato de texto usado para representar canto gregoriano. O formato GABC é utilizado pelo programa Gregorio para compilar partituras em notação gregoriana.

## Funcionalidades

- Criação de novos arquivos GABC com cabeçalhos apropriados
- Edição de arquivos GABC existentes
- Validação básica de sintaxe GABC
- Interface de linha de comando para operações rápidas

## Instalação

Este é um módulo Node.js. Para utilizá-lo, certifique-se de ter o Node.js instalado em seu sistema.

```bash
# Navegue até o diretório do editor
cd Prophetiarium-Xicatunense/transcriptions

# Execute o editor
node gabc-editor-cli.js
```

## Uso

O editor oferece duas opções principais:

1. **Criar novo arquivo GABC**: Solicita informações como nome da melodia, parte litúrgica, modo, livro de origem, etc., e cria um novo arquivo GABC com base nessas informações.

2. **Modificar arquivo GABC existente**: Permite carregar um arquivo GABC existente e modificar seus componentes (nome, parte litúrgica, modo, conteúdo musical, etc.).

## Formato GABC

O formato GABC é composto por dois elementos principais:

1. **Cabeçalho**: Contém metadados sobre a melodia, como nome, modo, parte litúrgica, etc.
2. **Corpo**: Contém a representação textual da melodia em si, usando caracteres ASCII para representar notas, palavras e ornamentações.

## Exemplo de uso

Ao executar o editor, você será guiado por um processo de perguntas para criar ou modificar um arquivo GABC. Por exemplo, ao criar uma nova melodia, você fornecerá:

- Nome da melodia
- Parte litúrgica (Introito, Gradual, Aleluia, etc.)
- Modo (1 a 8)
- Livro de origem
- Transcritor
- Comentário opcional
- Conteúdo musical no formato GABC

## Validação

O editor inclui verificações básicas para garantir que os arquivos GABC sigam a estrutura correta, incluindo:

- Campos obrigatórios preenchidos
- Presença do delimitador `%%` antes do conteúdo musical
- Conteúdo de melodia válido

## Contribuição

Este editor é uma ferramenta básica projetada para facilitar a criação e modificação de arquivos GABC. Contribuições para expandir suas funcionalidades são bem-vindas.