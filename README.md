# coeur-saint-ioseph-tool

## CI / CD

- **CI** (`.github/workflows/ci.yml`): em `push`/`pull_request` para `main` ou `master`, verifica ficheiros essenciais e `node --check` nos `.mjs` em `Prophetiarium-Xicatunense/transcriptions/`.
- **Deploy** (`.github/workflows/deploy-github-pages.yml`): em `push` para `main` ou `master`, publica o repositório (exceto `.git` e `.github`) no **GitHub Pages**.

### Ativar GitHub Pages

1. No repositório: **Settings → Pages**.
2. Em **Build and deployment**, **Source**: escolher **GitHub Actions**.
3. O URL do site será `https://<utilizador>.github.io/<repositório>/` (ex.: `propers.html` em `.../coeur-saint-ioseph-tool/propers.html`).

Caminhos nos HTML são relativos, por isso funcionam com o prefixo do nome do repo no Pages.

### Se o deploy falhar com submódulos

O GitHub por vezes sugere um workflow **Jekyll** para Pages; esse fluxo faz `checkout` com `submodules: recursive` e falha se existir um *gitlink* sem entrada em `.gitmodules`. Este repositório usa deploy **estático** (`deploy-github-pages.yml`), não Jekyll. Em **Actions**, remove workflows como `jekyll-gh-pages.yml` / `pages-build-deployment` baseados em Jekyll, ou altera o `checkout` para `submodules: false`. Foi removido um submódulo órfão em `Prophetiarium-Xicatunense/docs-exsurge/exsurge` (pasta vazia, sem `.gitmodules`).