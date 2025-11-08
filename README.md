# Sistema de Combate Naval

Resumo
-------
Simulação local de uma interface naval com radar, console e sistema de criptografia (cifra de César). Projeto para demonstração/APS com front-end em HTML/CSS/JS e servidor Python (stdlib) que expõe endpoints para criptografar/descriptografar mensagens.

Arquivos principais
-------------------
- index.html — interface do usuário.
- styles.css — estilos (tema naval).
- app.js — lógica do cliente (radar, console, criptografia, alertas).
- crypto_server.py — servidor HTTP em Python que fornece /encrypt e /decrypt.

Requisitos
----------
- Python 3.7+ (somente bibliotecas padrão).
- Navegador moderno (Chrome/Edge/Firefox).
- Git (para controle de versão) e conta no GitHub (para publicação).

Como executar (Windows)
-----------------------
1. Abra PowerShell e entre no diretório do projeto:
   cd "C:\Users\gabri\OneDrive\Área de Trabalho\aps - o final"

2. Inicie o servidor Python:
   python crypto_server.py
   (se `python` não estiver no PATH, use `py crypto_server.py` ou o caminho completo do executável)

3. Abra no navegador:
   http://localhost:8000/

Testes rápidos
--------------
- Teste o endpoint de criptografia:
  curl -X POST http://localhost:8000/encrypt -H "Content-Type: application/json" -d "{\"message\":\"teste\"}"

Observações e recomendações
--------------------------
- A cifra de César é apenas educativa — não use para proteger dados sensíveis.
- O servidor foi feito para uso local/desenvolvimento. Para produção é necessário HTTPS, autenticação, logs e validação.
- Sinta-se livre para ajustar mensagens e assets (sons, imagens).

Contribuição
------------
1. Fork do repositório
2. Crie branch com nome descritivo
3. Abra Pull Request com descrição das mudanças

Licença
-------
MIT — ver arquivo LICENSE.md