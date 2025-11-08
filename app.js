// Elementos do DOM (pt-BR)
const sobreposicaoLogin = document.getElementById('sobreposicaoLogin');
const interfacePrincipal = document.getElementById('interfacePrincipal');
const formularioLogin = document.getElementById('formularioLogin');
const doisFatores = document.getElementById('doisFatores');
const verificarCodigoAuth = document.getElementById('verificarCodigoAuth');
const faixaAlerta = document.getElementById('faixaAlerta');
const horaLocal = document.getElementById('horaLocal');
const telaRadar = document.querySelector('.radar-screen');
const listaContatos = document.getElementById('listaContatos');
const contadorContatos = document.getElementById('contadorContatos');
const saidaConsole = document.getElementById('saidaConsole');
const entradaConsole = document.getElementById('entradaConsole');
const enviarConsole = document.getElementById('enviarConsole');

// Cripto (pt-BR)
const entradaCripto = document.getElementById('entradaCripto');
const entradaCriptoados = document.getElementById('entradaCriptoados');
const saidaDescripto = document.getElementById('saidaDescripto');
const btnCripto = document.getElementById('btnCripto');
const btnDecripto = document.getElementById('btnDecripto');
const btnEnviarCripto = document.getElementById('btnEnviarCripto');
const btnLimparCripto = document.getElementById('btnLimparCripto');

// Som (pt-BR)
const btnMudo = document.getElementById('btnMudo');
const btnVolumeMenos = document.getElementById('btnVolumeMenos');
const btnVolumeMais = document.getElementById('btnVolumeMais');

// Áudios (placeholders)
const somRadar = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
const somAlerta = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
const somMensagem = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
const somInimigo = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');

let estaMudo = false;
let volume = 0.3;

// Dados do radar
let contatos = [];
let contadorIdContato = 0;
let intervaloInimigo, intervaloAliado, intervaloDesconhecido, intervaloAlertasPt = null;

// Mensagens internas (pt-BR)
const mensagens = {
    alerta: [
        {text: "INIMIGO À VISTA", type: "alert"},
        {text: "CONTATO HOSTIL DETECTADO", type: "alert"},
        {text: "AMEAÇA AÉREA IDENTIFICADA", type: "alert"}
    ],
    aviso: [
        {text: "EMBARCAÇÃO NÃO IDENTIFICADA NA ÁREA", type: "warning"},
        {text: "RADAR DETECTANDO INTERFERÊNCIA", type: "warning"}
    ],
    info: [
        {text: "NAVIO AMIGO A 50KM - FRAGATA INDEPENDÊNCIA", type: "info"},
        {text: "PATRULHA AÉREA CHEGANDO AO SETOR 4", type: "info"},
        {text: "SISTEMA DE ARMAS VERIFICADO - ONLINE", type: "info"}
    ]
};

// Inicialização de áudio
function iniciarAudio() {
    somRadar.loop = true;
    atualizarVolume();
}
function atualizarVolume() {
    [somRadar, somAlerta, somMensagem, somInimigo].forEach(s => s.volume = estaMudo ? 0 : volume);
}
function tocarSomRadar() { if (!estaMudo) somRadar.play().catch(()=>{}); }
function pararSomRadar() { somRadar.pause(); somRadar.currentTime = 0; }
function tocarSomAlerta() { if (!estaMudo) somAlerta.play().catch(()=>{}); }
function tocarSomMensagem() { if (!estaMudo) somMensagem.play().catch(()=>{}); }
function tocarSomInimigo() { if (!estaMudo) somInimigo.play().catch(()=>{}); }

// Atualizar hora local
function atualizarHora() {
    const agora = new Date();
    horaLocal.textContent = agora.toLocaleTimeString('pt-BR');
}

// Criptografia via servidor Python (chamadas HTTP)
async function criptografarMensagem(mensagem) {
    if (!mensagem) return '';
    try {
        const res = await fetch('/encrypt', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: mensagem })
        });
        if (!res.ok) return '';
        const data = await res.json();
        return data.encrypted || '';
    } catch (e) {
        console.error('Erro criptografar:', e);
        return '';
    }
}
async function descriptografarMensagem(cript) {
    if (!cript) return '';
    try {
        const res = await fetch('/decrypt', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ encrypted: cript })
        });
        if (!res.ok) return '';
        const data = await res.json();
        return data.decrypted || '';
    } catch (e) {
        console.error('Erro descriptografar:', e);
        return '';
    }
}

// Adicionar contato ao radar
function adicionarContato(tipo, x, y, rotulo) {
    contadorIdContato++;
    const contato = { id: contadorIdContato, tipo, x, y, rotulo };
    contatos.push(contato);

    const el = document.createElement('div');
    el.className = `contact ${tipo}`;
    el.id = `contato-${contato.id}`;
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;

    const label = document.createElement('div');
    label.className = 'contact-label';
    label.textContent = rotulo;
    el.appendChild(label);
    telaRadar.appendChild(el);

    const item = document.createElement('div');
    item.className = `contact-item ${tipo}`;
    item.id = `contato-lista-${contato.id}`;
    const s1 = document.createElement('span'); s1.textContent = rotulo;
    const s2 = document.createElement('span'); s2.textContent = tipo === 'enemy' ? 'INIMIGO' : tipo === 'friendly' ? 'ALIADO' : 'DESCONHECIDO';
    item.appendChild(s1); item.appendChild(s2);
    listaContatos.appendChild(item);

    contadorContatos.textContent = contatos.length;

    if (tipo === 'enemy') {
        faixaAlerta.style.display = 'block';
        tocarSomInimigo();
        addConsoleMessage(`ALERTA: CONTATO INIMIGO DETECTADO - ${rotulo}`, 'alert');
        setTimeout(()=>{ faixaAlerta.style.display = 'none'; }, 5000);
    }

    setTimeout(()=> removerContato(contato.id), 15000);
}

// Remover por id
function removerContato(id) {
    const idx = contatos.findIndex(c => c.id === id);
    if (idx !== -1) {
        contatos.splice(idx, 1);
        const el = document.getElementById(`contato-${id}`); if (el) el.remove();
        const li = document.getElementById(`contato-lista-${id}`); if (li) li.remove();
        contadorContatos.textContent = contatos.length;
    }
}

// Mensagens no console (seguro)
function addConsoleMessage(mensagem, tipo = 'info') {
    const agora = new Date();
    const hora = agora.toLocaleTimeString('pt-BR');
    const linha = document.createElement('div');
    linha.className = `message-${tipo}`;
    linha.textContent = `[${hora}] ${mensagem}`;
    saidaConsole.appendChild(linha);
    saidaConsole.scrollTop = saidaConsole.scrollHeight;
    tocarSomMensagem();
}

// Mensagens criptografadas aleatórias (mantive integração existente)
async function sendRandomEncryptedMessage() {
    const categorias = ['alerta','aviso','info'];
    const pesos = [0.2,0.3,0.5];

    let r = Math.random(), sum = 0, idx = 0;
    for (let i=0;i<pesos.length;i++){ sum+=pesos[i]; if (r<=sum){ idx=i; break; } }
    const cat = categorias[idx];
    const arr = mensagens[cat] || mensagens.info;
    const msg = arr[Math.floor(Math.random()*arr.length)];
    const cript = await criptografarMensagem(msg.text);
    addConsoleMessage(`🔒 MENSAGEM CRIPTOGRAFADA RECEBIDA: ${cript}`, 'encrypted');

    setTimeout(async ()=>{
        const dec = await descriptografarMensagem(cript);
        addConsoleMessage(`✅ MENSAGEM DESCRIPTOGRAFADA: ${dec}`, msg.type);
    }, 2000);

    const proximo = 5000 + Math.random()*10000;
    setTimeout(sendRandomEncryptedMessage, proximo);
}

// Alertas em PT-BR a cada 10s
const alertasPt = [
    "INIMIGO À VISTA",
    "CONTATO HOSTIL DETECTADO",
    "INIMIGO SE APROXIMA",
    "AMEAÇA AÉREA IDENTIFICADA",
    "MÍSSEIS AVISTADOS - EVADIR",
    "CONTATO NÃO IDENTIFICADO - INVESTIGAR",
    "PREPARAR PARA COMBATE"
];

function agendarAlertasPt() {
    if (intervaloAlertasPt) return;
    intervaloAlertasPt = setInterval(()=>{
        const frase = alertasPt[Math.floor(Math.random()*alertasPt.length)];
        addConsoleMessage(`PT-BR: ${frase}`, 'alert');
        tocarSomAlerta();
        faixaAlerta.style.display = 'block';
        setTimeout(()=>{ faixaAlerta.style.display = 'none'; }, 4000);
    }, 10000);
}

// Iniciar / Parar simulação do radar
function iniciarSimulacaoRadar() {
    tocarSomRadar();

    intervaloInimigo = setInterval(()=>{
        const x = 20 + Math.random()*60;
        const y = 20 + Math.random()*60;
        const labels = ['ALVO 01','ALVO 02','ALVO 03','ALVO 04'];
        adicionarContato('enemy', x, y, labels[Math.floor(Math.random()*labels.length)]);
    }, 8000);

    intervaloAliado = setInterval(()=>{
        const x = 20 + Math.random()*60;
        const y = 20 + Math.random()*60;
        const labels = ['NAVIO AMIGO 01','NAVIO AMIGO 02','HELICÓPTERO AMIGO'];
        adicionarContato('friendly', x, y, labels[Math.floor(Math.random()*labels.length)]);
    }, 12000);

    intervaloDesconhecido = setInterval(()=>{
        if (Math.random() > 0.7) {
            const x = 20 + Math.random()*60;
            const y = 20 + Math.random()*60;
            adicionarContato('unknown', x, y, 'CONTATO DESCONHECIDO');
        }
    }, 15000);

    setTimeout(sendRandomEncryptedMessage, 3000);
    agendarAlertasPt();
}

function pararSimulacaoRadar() {
    clearInterval(intervaloInimigo);
    clearInterval(intervaloAliado);
    clearInterval(intervaloDesconhecido);
    clearInterval(intervaloAlertasPt);
    intervaloAlertasPt = null;
    pararSomRadar();
}

// Listeners e fluxo de login (pt-BR)
console.log('app.js carregado', { sobreposicaoLogin, interfacePrincipal, formularioLogin, verificarCodigoAuth });

formularioLogin.addEventListener('submit', function(e){
    e.preventDefault();
    doisFatores.style.display = 'block';
    const c = document.getElementById('codigoAuth');
    if (c) c.focus();
});

const inputCodigo = document.getElementById('codigoAuth');
if (inputCodigo) {
    inputCodigo.addEventListener('keypress', function(e){
        if (e.key === 'Enter') verificarCodigoAuth.click();
    });
}

verificarCodigoAuth.addEventListener('click', function(){
    const codigo = (document.getElementById('codigoAuth').value || '').trim();
    // para desenvolvimento: aceitar vazio ou 6 dígitos
    if (codigo.length === 6 || codigo.length === 0) {
        sobreposicaoLogin.classList.add('hidden');
        interfacePrincipal.classList.remove('hidden');
        addConsoleMessage("USUÁRIO AUTENTICADO - SISTEMA DE COMBATE ATIVADO");
        iniciarSimulacaoRadar();
    } else {
        alert('Código de autenticação inválido. Digite os 6 dígitos.');
    }
});

// Cripto — botões
btnCripto.addEventListener('click', async function(){
    const msg = (entradaCripto.value || '').trim();
    if (!msg) return;
    const cript = await criptografarMensagem(msg);
    entradaCriptoados.value = cript;
    addConsoleMessage(`✅ MENSAGEM CRIPTOGRAFADA: ${cript}`, 'info');
});

btnDecripto.addEventListener('click', async function(){
    const cript = (entradaCriptoados.value || '').trim();
    if (!cript) return;
    const dec = await descriptografarMensagem(cript);
    saidaDescripto.value = dec;
    addConsoleMessage(`✅ MENSAGEM DESCRIPTOGRAFADA: ${dec}`, 'info');
});

btnEnviarCripto.addEventListener('click', async function(){
    const cript = (entradaCriptoados.value || '').trim();
    if (!cript) return;
    addConsoleMessage(`📤 MENSAGEM CRIPTOGRAFADA ENVIADA: ${cript}`, 'info');
    setTimeout(async ()=>{
        const respostas = [
            "Mensagem recebida e compreendida",
            "Confirmado, procedendo conforme instruções",
            "Aguardando novas ordens",
            "Situação sob controle"
        ];
        const r = respostas[Math.floor(Math.random()*respostas.length)];
        const criptResp = await criptografarMensagem(r);
        addConsoleMessage(`🔒 RESPOSTA CRIPTOGRAFADA: ${criptResp}`, 'encrypted');
        setTimeout(async ()=>{
            const dec = await descriptografarMensagem(criptResp);
            addConsoleMessage(`✅ RESPOSTA DESCRIPTOGRAFADA: ${dec}`, 'info');
        }, 1500);
    }, 2000);
});

btnLimparCripto.addEventListener('click', function(){
    entradaCripto.value = '';
    entradaCriptoados.value = '';
    saidaDescripto.value = '';
});

// Console input
enviarConsole.addEventListener('click', function(){
    const cmd = (entradaConsole.value || '').trim();
    if (!cmd) return;
    addConsoleMessage(`COMANDO: ${cmd}`);
    entradaConsole.value = '';
});
entradaConsole.addEventListener('keypress', function(e){
    if (e.key === 'Enter') enviarConsole.click();
});

// Controles de som
btnMudo.addEventListener('click', function(){
    estaMudo = !estaMudo;
    btnMudo.textContent = estaMudo ? "🔇 MUDO" : "🔊 SOM";
    atualizarVolume();
});
btnVolumeMenos.addEventListener('click', function(){
    if (volume > 0.1) { volume = Math.max(0, +(volume - 0.1).toFixed(1)); atualizarVolume(); }
});
btnVolumeMais.addEventListener('click', function(){
    if (volume < 1) { volume = Math.min(1, +(volume + 0.1).toFixed(1)); atualizarVolume(); }
});

// Controles de armas (mensagem no console)
document.querySelectorAll('.weapon-btn').forEach(btn => {
    btn.addEventListener('click', function(){
        const arma = this.dataset.weapon;
        const acao = this.dataset.action;
        addConsoleMessage(`SISTEMA ${arma.toUpperCase()} - ${acao.toUpperCase()} ACIONADO`);
    });
});

// Login form handling
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // autenticação direta (DESATIVAR apenas para desenvolvimento)
    loginOverlay.classList.add('hidden');
    mainInterface.classList.remove('hidden');
    addConsoleMessage("USUÁRIO AUTENTICADO - SISTEMA DE COMBATE ATIVADO");
    startRadarSimulation();
});

// permitir Enter no campo authCode
const authInput = document.getElementById('authCode');
if (authInput) {
    authInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyAuthCode.click();
        }
    });
}

verifyAuthCode.addEventListener('click', function() {
    const authCode = document.getElementById('authCode').value.trim();
    // modo desenvolvimento: aceitar código vazio ou forçar 6 dígitos
    if (authCode.length === 6 || authCode.length === 0) {
        loginOverlay.classList.add('hidden');
        mainInterface.classList.remove('hidden');
        addConsoleMessage("USUÁRIO AUTENTICADO - SISTEMA DE COMBATE ATIVADO");
        startRadarSimulation();
    } else {
        alert('Código de autenticação inválido. Digite os 6 dígitos.');
    }
});

// Initialize
initAudio();
updateTime();
setInterval(updateTime, 1000);

// adicionar debug inicial (logo após obter elementos DOM)
console.log('app.js carregado', { loginOverlay, mainInterface, loginForm, verifyAuthCode });
if (!verifyAuthCode) console.error('verifyAuthCode não encontrado no DOM');

function scheduleMultilingualAlerts() {
    // já evita criar múltiplos timers
    if (multilingualInterval) return;
    multilingualInterval = setInterval(() => {
        const langs = Object.keys(multilingualMessages);
        const lang = langs[Math.floor(Math.random() * langs.length)];
        const phrases = multilingualMessages[lang];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];

        // exibe no console da UI e dispara som/banner
        addConsoleMessage(`${lang.toUpperCase()}: ${phrase}`, 'alert');
        playAlertSound();
        alertBanner.style.display = 'block';
        setTimeout(() => { alertBanner.style.display = 'none'; }, 4000);
    }, 10000); // 10 segundos
}

function startRadarSimulation() {
    playRadarSound();
    enemyInterval = setInterval(() => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        addContact('enemy', x, y);
    }, 5000);

    friendlyInterval = setInterval(() => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        addContact('friendly', x, y);
    }, 7000);

    unknownInterval = setInterval(() => {
        if (Math.random() > 0.7) {
            const x = 20 + Math.random() * 60;
            const y = 20 + Math.random() * 60;
            addContact('unknown', x, y, 'CONTATO DESCONHECIDO');
        }
    }, 15000);

    // inicia mensagens criptografadas existentes
    setTimeout(sendRandomEncryptedMessage, 3000);

    // iniciar mensagens multilíngues a cada 10s
    scheduleMultilingualAlerts();
}

function stopRadarSimulation() {
    clearInterval(enemyInterval);
    clearInterval(friendlyInterval);
    clearInterval(unknownInterval);
    clearInterval(multilingualInterval); // << limpar também
    multilingualInterval = null;
    stopRadarSound();
}