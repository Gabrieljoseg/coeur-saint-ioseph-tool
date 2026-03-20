# coeur-saint-ioseph-tool

## CI / CD

- **CI** (`.github/workflows/ci.yml`): em `push`/`pull_request` para `main` ou `master`, verifica ficheiros essenciais e `node --check` nos `.mjs` em `Prophetiarium-Xicatunense/transcriptions/`.
- **Deploy** (`.github/workflows/deploy-github-pages.yml`): em `push` para `main` ou `master`, publica o repositório (exceto `.git` e `.github`) no **GitHub Pages**.

### Ativar GitHub Pages

1. No repositório: **Settings → Pages**.
2. Em **Build and deployment**, **Source**: escolher **GitHub Actions**.
3. O URL do site será `https://<utilizador>.github.io/<repositório>/` (ex.: `propers.html` em `.../coeur-saint-ioseph-tool/propers.html`).

Caminhos nos HTML são relativos, por isso funcionam com o prefixo do nome do repo no Pages.