# Raízes Literárias

Site dedicado à literatura dos PALOP (Países Africanos de Língua Oficial Portuguesa).

## Estrutura do Projeto

```
raizes-literarias/
├── index.html          # Página principal
├── paises.html         # Países PALOP
├── comunidade.html     # Comunidade e chat
├── entrevistas.html    # Entrevistas no YouTube
├── loja.html           # Loja de livros
├── css/
│   └── style.css       # Estilos
├── js/
│   └── main.js         # JavaScript
└── README.md           # Este arquivo
```

## Funcionalidades

- Design moderno e responsivo
- Modo escuro/claro
- Filtro de livros por país
- Contagem regressiva para lançamentos
- Chat com escritores (simulado)
- Integração YouTube
- Sistema de carrinho
- Newsletter

## Publicar no GitHub Pages

### Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome: `raizes-literarias`
4. Marque "Public"
5. Clique em "Create repository"

### Passo 2: Enviar os Arquivos

Abra o terminal na pasta do projeto e execute:

```bash
git init
git add .
git commit -m "Primeira versão do site Raízes Literárias"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/raizes-literarias.git
git push -u origin main
```

### Passo 3: Ativar GitHub Pages

1. Vá para o repositório no GitHub
2. Clique em "Settings"
3. No menu lateral, clique em "Pages"
4. Em "Source", selecione "Deploy from a branch"
5. Selecione a branch "main" e pasta "/ (root)"
6. Clique em "Save"

### Passo 4: Acessar o Site

Após alguns minutos, o site estará disponível em:
```
https://SEU-USUARIO.github.io/raizes-literarias/
```

## Personalização

### Alterar Cores

Edite o arquivo `css/style.css` e modifique as variáveis no início:

```css
:root {
  --terracotta: #C75B39;
  --dourado: #D4A843;
  --verde: #2D5A3D;
}
```

### Adicionar Livros

No arquivo `index.html`, copie um bloco de livro existente e altere:

```html
<div class="livro-card animate-on-scroll" data-pais="angola" data-preco="pago">
  <div class="livro-cover">
    <div class="livro-cover-img" style="background: linear-gradient(135deg, #cor1, #cor2);">
      <i class="fas fa-book"></i>
    </div>
  </div>
  <div class="livro-info">
    <h4>Título do Livro</h4>
    <p class="autor">Nome do Autor</p>
    <span class="pais">País</span>
  </div>
  <div class="livro-preco">
    <span class="preco">1.500 Kz</span>
    <button class="btn-comprar">Comprar</button>
  </div>
</div>
```

### Adicionar Vídeos do YouTube

Substitua `VIDEO_ID_1` pelo ID real do vídeo do YouTube.

Exemplo: se a URL é `https://www.youtube.com/watch?v=abc123`, o ID é `abc123`.

## Tecnologias

- HTML5
- CSS3 (Variáveis, Grid, Flexbox, Animações)
- JavaScript (ES6+)
- Font Awesome (Ícones)
- Google Fonts (Tipografia)

## Licença

© 2026 Raízes Literárias. Todos os direitos reservados.
