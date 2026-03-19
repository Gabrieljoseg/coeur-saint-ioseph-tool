# 📚 Documentação do Coeur Saint Ioseph Tool

## Visão Geral

O **Coeur Saint Ioseph Tool** é uma aplicação web para geração, transcrição e renderização de Canto Gregoriano usando o formato GABC e a biblioteca Exsurge.js para renderização de partituras.

---

## 🏗️ Arquitetura da Aplicação

### Stack Tecnológico

| Tecnologia | Função |
|------------|--------|
| **JavaScript (ES5/ES6+)** | Linguagem principal |
| **jQuery** | Manipulação do DOM |
| **Exsurge.js** | Renderização de partituras GABC em SVG |
| **Tone.js / Web Audio API** | Playback de áudio das notas |
| **Bootstrap 3** | Estilização da interface |
| **Moment.js** | Cálculos de datas litúrgicas |

---

## 📁 Estrutura de Arquivos

```
coeur-saint-ioseph-tool/
├── propers.html              # Interface principal
├── propers.js                # Lógica de carregamento e renderização
├── propersdata.js            # Dados dos próprios (rito tradicional)
├── propersdatanovus.js       # Dados dos próprios (Novus Ordo)
├── psalmtone.js              # Lógica de tons salmódicos
├── exsurge.min.js            # Motor de renderização GABC
├── util.js                   # Funções utilitárias
├── js/tones.js               # Biblioteca de áudio
├── Prophetiarium-Xicatunense/
│   └── transcriptions/       # Arquivos GABC das Profecias
├── gabc/                     # Arquivos GABC dos cantos
├── css/                      # Folhas de estilo
└── docs/                     # Documentação
```

---

## 🎵 Formato GABC

### Sintaxe Básica

O formato **GABC** (Gregorian ABC) é um formato de texto para representar canto gregoriano:

```gabc
name: PROPHETIA III;
office-part: PROPHETIA III;
mode: 1;
%%
(c4) In(dewf) di-(gf) é-(ef)bus(gxghg)(hih) il-(hg) lis:(f.d. :')
```

### Elementos GABC

| Símbolo | Significado |
|---------|-------------|
| `a-g` | Notas musicais (lá a sol) |
| `'` | Agudo (uma oitava acima) |
| `_` | Grave (uma oitava abaixo) |
| `~` | Quilisma |
| `!` | Nota líquescente |
| `()` | Sílabas do texto |
| `|` | Barra simples |
| `*` | Barra dupla |
| `::` | Barra final |
| `(,)` | Vírgula |
| `(:)` | Meio ponto |
| `(.)` | Ponto final |

### Cabeçalho GABC

```gabc
name: NOME_DO_CANTO;          # Nome
office-part: TIPO;             # Parte da missa
mode: 1-8;                     # Modo gregoriano
book: LIVRO;                   # Livro de origem
transcriber: TRANSCRITOR;      # Quem transcreveu
commentary: REFERÊNCIA;        # Referência bíblica
centering-scheme: latin;       # Esquema de centralização
%%                              # Fim do cabeçalho
```

---

## 🎼 Sistema de Renderização

### Fluxo de Renderização

```
1. Carregar arquivo GABC
   ↓
2. Parse do cabeçalho (getHeader)
   ↓
3. Extrair corpo GABC
   ↓
4. Criar contexto Exsurge (makeExsurgeChantContext)
   ↓
5. Criar mappings (exsurge.Gabc.createMappingsFromSource)
   ↓
6. Criar score (new exsurge.ChantScore)
   ↓
7. Fazer layout (score.layout())
   ↓
8. Obter SVG (score.getSvg())
   ↓
9. Inserir no DOM
```

### Código de Exemplo

```javascript
// 1. Criar contexto
var ctxt = makeExsurgeChantContext();

// 2. Criar mappings do GABC
var mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabcString);

// 3. Criar score
var score = new exsurge.ChantScore(ctxt, mappings, true);

// 4. Adicionar anotação (modo, parte)
if (gabcHeader.mode) {
  score.annotation = new exsurge.Annotations(
    ctxt, 
    '%'+partAbbrev[officePart]+'%', 
    '%'+romanNumeral[mode]+'%'
  );
}

// 5. Fazer layout
score.layout();

// 6. Obter SVG
var svg = score.getSvg();

// 7. Inserir no DOM
$('#preview').append(svg);
```

---

## 🎵 Sistema de Playback de Áudio

### Arquitetura do Playback

```
1. Extrair notas do score
   ↓
2. Converter staffPosition → Frequência (Hz)
   ↓
3. Criar osciladores (Web Audio API)
   ↓
4. Agendar notas no tempo
   ↓
5. Tocar com highlight visual
```

### Conversão de Notas para Frequência

```javascript
function staffPositionToFrequency(staffPosition, clef) {
  // Do clef: staffPosition 0 = C4 (261.63 Hz)
  // Fa clef: staffPosition 0 = F3 (174.61 Hz)
  
  var baseFreq = (clef === 'c') ? 261.63 : 174.61;
  
  // Intervalos em semitons: [C, D, E, F, G, A, B]
  var semitones = [0, 2, 4, 5, 7, 9, 11];
  
  var octaveOffset = Math.floor(staffPosition / 7);
  var scaleIndex = ((staffPosition % 7) + 7) % 7;
  var totalSemitones = octaveOffset * 12 + semitones[scaleIndex];
  
  // Fórmula: f = f0 * 2^(n/12)
  return baseFreq * Math.pow(2, totalSemitones / 12);
}
```

### Tocar uma Nota

```javascript
function playNote(audioContext, frequency, startTime, duration) {
  var oscillator = audioContext.createOscillator();
  var gainNode = audioContext.createGain();
  
  // Configurar oscilador
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  // Envelope ADSR simplificado
  var attackTime = 0.05;
  var releaseTime = 0.1;
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + attackTime);
  gainNode.gain.setValueAtTime(0.3, startTime + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  
  // Conectar e agendar
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}
```

### Controles de Playback

```javascript
// Play
$('#btnPlay').on('click', function() {
  playChant(score);
});

// Stop
$('#btnStop').on('click', function() {
  stopChant();
});

// Tempo
$('#sliderTempo').on('input', function() {
  $('#lblTempo').text(this.value);
});
```

---

## 📅 Calendário Litúrgico

### Estrutura do Ano Litúrgico

```
Tempus Adventus     (Advento)
Tempus Natalis      (Natal)
Tempus Quadragesimae (Quaresma)
Tempus Paschae      (Páscoa)
Tempus per Annum    (Tempo Comum)
```

### Cálculo da Páscoa

```javascript
// Usando moment.easter.js
var pascha = moment.easter(ano);
var septuagesima = moment(pascha).subtract(7*9, 'days');
var ascension = moment(pascha).add(39, 'days');
var pentecost = moment(pascha).add(49, 'days');
```

### Partes da Missa

| Parte | Latim | Descrição |
|-------|-------|-----------|
| Introito | Introitus | Canto de entrada |
| Kyrie | Kyrie | Senhor, tende piedade |
| Gloria | Gloria | Glória a Deus nas alturas |
| Gradual | Graduale | Canto após a Epístola |
| Aleluia | Alleluia | Aclamação ao Evangelho |
| Sequência | Sequentia | Hino especial |
| Ofertório | Offertorium | Canto do ofertório |
| Sanctus | Sanctus | Santo, Santo, Santo |
| Agnus Dei | Agnus Dei | Cordeiro de Deus |
| Comunhão | Communio | Canto da comunhão |

---

## 🔧 Funções Principais

### loadProphetia(number)

Carrega uma Profecia específica do Prophetiarium Xicatunense.

```javascript
window.loadProphetia = function(number) {
  // 1. Esconder outras seções
  $('.lectio, #divIntroitus, ...').hide();
  
  // 2. Mostrar divCustom
  $('#divCustom').show();
  
  // 3. Carregar arquivo GABC
  $.get('Prophetiarium-Xicatunense/transcriptions/PROPHETIA_' + number + '.gabc')
    .done(function(data) {
      // 4. Parse do GABC
      var parts = data.split('%%');
      var headerStr = parts[0].trim();
      var gabcBody = parts[parts.length - 1].trim();
      
      // 5. Renderizar
      renderProphetiaDirect(gabcBody, headerStr);
    });
};
```

### renderProphetiaDirect(gabcBody, headerStr)

Renderiza a partitura usando Exsurge.js.

```javascript
function renderProphetiaDirect(gabcBody, headerStr) {
  // 1. Criar contexto Exsurge
  var ctxt = makeExsurgeChantContext();
  
  // 2. Criar mappings
  var mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabcBody);
  
  // 3. Criar score
  var score = new exsurge.ChantScore(ctxt, mappings, true);
  
  // 4. Fazer layout
  score.layout();
  
  // 5. Obter SVG
  var svg = score.getSvg();
  
  // 6. Inserir no DOM
  $('#custom-preview').empty().append(svg);
  
  // 7. Adicionar controles de playback
  addPlaybackControls($('#custom-preview'), score);
}
```

### playChant(score)

Toca o canto usando Web Audio API.

```javascript
function playChant(score) {
  // 1. Obter AudioContext
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // 2. Extrair todas as notas do score
  var allNotes = [];
  for (var i = 0; i < score.notations.length; i++) {
    var notation = score.notations[i];
    if (notation.isNeume && notation.notes) {
      for (var j = 0; j < notation.notes.length; j++) {
        allNotes.push({
          staffPosition: notation.notes[j].staffPosition,
          text: notation.lyrics[0].text
        });
      }
    }
  }
  
  // 3. Tocar cada nota
  var currentTime = audioContext.currentTime;
  allNotes.forEach(function(noteData, index) {
    var freq = staffPositionToFrequency(noteData.staffPosition, clef);
    playNote(audioContext, freq, currentTime, duration);
    currentTime += duration * 0.8; // Legato
  });
}
```

---

## 🎨 Estilização CSS

### Controles de Playback

```css
.playback-controls {
  margin-top: 10px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.playback-controls button {
  margin-right: 10px;
}
```

### Highlight de Notas

```css
.note-highlight {
  fill: #ff6600 !important;
  stroke: #ff6600 !important;
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 3px #ff6600);
}
```

---

## 🚀 Como Executar

### Pré-requisitos

- Python 3.x (para servidor HTTP)
- Navegador moderno (Chrome, Firefox, Edge)

### Passos

1. **Navegue até a pasta do projeto:**
   ```bash
   cd c:\Users\LENOVO\Documents\coeur-saint-ioseph-tool
   ```

2. **Inicie o servidor HTTP:**
   ```bash
   python -m http.server 8000
   ```

3. **Abra no navegador:**
   ```
   http://localhost:8000/propers.html
   ```

4. **Teste o playback:**
   - Clique em "Prophetias" → "Prophetia III"
   - Aguarde a partitura renderizar
   - Clique em "▶ Play"

---

## 📝 Estrutura de Dados

### Objeto `sel`

Armazena o estado de cada canto:

```javascript
sel = {
  custom: {
    ctxt: { /* Exsurge context */ },
    gabc: "gabc completo",
    activeGabc: "gabc para renderização",
    text: "texto do canto",
    style: "full",
    score: { /* Exsurge score */ }
  },
  introitus: { ... },
  graduale: { ... },
  // ...
}
```

### Objeto `selCustom`

Armazena os IDs dos cantos customizados:

```javascript
selCustom = {
  customID: "prophetia_iii",
  // ...
}
```

---

## 🔍 Debug e Logs

### Logs no Console

A aplicação usa logging extensivo para debug:

```javascript
console.log('=== loadProphetia: Iniciando ===');
console.log('Arquivo carregado com sucesso');
console.log('GABC Body length:', gabcBody.length);
console.log('=== renderProphetiaDirect: Completado ===');
console.log('=== playChant: Iniciando ===');
console.log('Nota 0: staffPosition=2, freq=293.66 Hz');
```

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Exsurge não está carregado` | exsurge.min.js não carregou | Recarregue a página |
| `GABC body está vazio` | Arquivo GABC vazio ou mal formatado | Verifique o arquivo |
| `Nenhuma nota encontrada` | Score sem notas | Verifique o parsing GABC |

---

## 📚 Referências

### Bibliotecas

- [Exsurge.js](https://github.com/frmatthew/exsurge) - Renderização de partituras
- [Tone.js](https://tonejs.github.io/) - Áudio web
- [Gregorio](https://gregorio-project.github.io/) - Software de notação gregoriana

### Formato GABC

- [Documentação GABC](https://gregorio-project.github.io/gabc/index.html)
- [Exemplos GABC](https://github.com/gregorio-project/gregorio-examples)

### Canto Gregoriano

- [Canticum Novum](https://www.canticumnovum.pt/)
- [Corpus Christi Watershed](https://www.ccwatershed.com/)

---

## 👥 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Crie um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Última atualização:** Março de 2026
