# Setembro Amarelo — Protótipo funcional

Site com 3 páginas (Home, Chats, Ajuda), tema visual de girassóis, chat em tempo
real por salas de assunto e localizador de UBS/CAPS por endereço.

## Estrutura de arquivos
```
projeto_setembroamarelo/
├── index.html                         Home
└── setembro-amarelo/
    ├── htmls/
    │   ├── chats.html                  Salas de conversa (chat em tempo real)
    │   └── ajuda.html                  CVV + localizador de UBS/CAPS
    ├── css/style.css                   Identidade visual
    └── js/
        ├── common.js                   Navbar + faixa fixa do CVV
        ├── firebase-config.js          Credenciais do Firebase (você precisa preencher)
        ├── chats.js                     Lógica do chat em tempo real
        └── ajuda.js                      Lógica do localizador de endereço
```

## Passo 1 — Rodar o site localmente
Como `chats.js` usa `import` (ES modules), não dá para abrir o `index.html`
direto no navegador (`file://`) — é preciso servir por http. A forma mais
simples:

```bash
python -m http.server 8000
```

Depois abra **http://localhost:8000** no navegador.

(Se preferir, qualquer servidor estático funciona: `npx serve`, extensão
"Live Server" do VS Code, etc.)

## Passo 2 — Ativar o chat de verdade (Firebase, gratuito)
O Chats já está pronto para funcionar com mensagens reais e sincronizadas
entre pessoas, mas precisa de um projeto Firebase (plano gratuito é
suficiente):

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto novo (gratuito).
2. No menu lateral, vá em **Build → Firestore Database → Criar banco de dados**.
   - Escolha **modo de teste** por enquanto (permite leitura/escrita livre por
     30 dias — ótimo para o protótipo da faculdade; antes de ir para produção
     de verdade, configure regras de segurança).
3. Vá em **Configurações do projeto (ícone de engrenagem) → Geral → Seus apps
   → Web (`</>`)** e registre um app. O Firebase vai te mostrar um objeto
   `firebaseConfig` com `apiKey`, `projectId`, etc.
4. Copie esses valores para dentro de `setembro-amarelo/js/firebase-config.js`, substituindo os
   textos de exemplo.
5. Salve, recarregue a página `chats.html` — pronto, as mensagens agora são
   reais e em tempo real (teste abrindo em duas abas ou dois navegadores).

Sem esse passo, o Chats mostra um aviso explicando que as credenciais
precisam ser preenchidas — o resto do site (Home e Ajuda) funciona
normalmente sem o Firebase.

## Passo 3 — Localizador de UBS/CAPS
Já funciona de verdade: o campo de endereço usa o **Nominatim**
(OpenStreetMap), que é gratuito e não exige chave de API, para converter o
endereço digitado em coordenadas. A partir daí, o site calcula a distância
até uma lista de unidades de saúde.

⚠️ **Importante:** a lista de UBS/CAPS em `js/ajuda.js` (`MOCK_UNITS`) é uma
lista de **exemplo**, com algumas unidades reais de capitais brasileiras,
apenas para o protótipo funcionar de ponta a ponta. Para um TCC ou uso real,
troque por dados oficiais do **CNES/DataSUS** (Cadastro Nacional de
Estabelecimentos de Saúde), que lista todas as UBS e CAPS do Brasil com
endereço e coordenadas.

## O que eu expandiria primeiro
Por ordem de impacto para o projeto de faculdade:

1. **Moderação real do chat.** Hoje existe só um alerta automático por
   palavras-chave (`ALERT_KEYWORDS` em `chats.js`) — é um recurso simples e
   didático, não uma triagem clínica. Para algo mais robusto: um botão de
   "denunciar mensagem", um painel simples de moderação, ou um aviso mais
   claro de que humanos não estão monitorando a sala 24h.
2. **Dados reais de UBS/CAPS via CNES**, em vez da lista de exemplo — isso
   sozinho torna o "Ajuda" genuinamente útil para qualquer endereço do Brasil.
3. **Autenticação leve** (ex: Firebase Auth anônimo) para evitar spam nas
   salas sem exigir cadastro — mantém o anonimato mas dá uma trilha técnica
   mínima em caso de abuso.
4. **Regras de segurança do Firestore** antes de qualquer uso além do
   protótipo — o "modo de teste" do passo 2 é aberto demais para produção.
5. **Testes com a persona real** (e, se possível, pessoas reais dentro do
   público-alvo) para validar se o tom do texto e as cores realmente
   transmitem acolhimento — copy e microtexto costumam mudar bastante depois
   desse teste.

## Sobre o tema sensível deste projeto
Este é um protótipo acadêmico. Se ele for usado além da sala de aula —
publicado ou divulgado para pessoas reais —, vale conversar com seu
orientador/professor sobre acompanhamento de um profissional de saúde mental
por trás do chat, já que o tema (saúde mental, possível ideação suicida)
exige cuidado além do que uma ferramenta de software sozinha resolve.
