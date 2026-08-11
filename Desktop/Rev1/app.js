// ============================================================
// REV1 - ASSISTENTE VIRTUAL ZUCCHETTI
// Frontend JavaScript
// ============================================================

// IMPORTANTE:
// Não usar 127.0.0.1 aqui quando o site estiver publicado.
// O Netlify encaminhará /api para o backend Python através
// do arquivo netlify.toml.
// do arquivo netlify.toml.
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_URL = IS_LOCAL 
    ? "http://127.0.0.1:8000/api/chat" 
    : "/api/chat";
    
// ============================================================
// ENTER PARA ENVIAR
// ============================================================

function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}


// ============================================================
// ENVIO DA MENSAGEM PARA A IA
// ============================================================

async function sendMessage() {

    const input = document.getElementById("userInput");

    if (!input) {
        console.error("Elemento #userInput não encontrado.");
        return;
    }

    const text = input.value.trim();

    if (!text) {
        return;
    }


    // --------------------------------------------------------
    // Mostra a mensagem do usuário
    // --------------------------------------------------------

    appendMessage(text, "user");

    input.value = "";

    input.focus();


    // --------------------------------------------------------
    // Mostra carregamento
    // --------------------------------------------------------

    const loadingId = appendLoading();


    try {

        console.log("REV1 enviando pergunta para:", API_URL);


        // ----------------------------------------------------
        // Chamada para o backend Python
        // ----------------------------------------------------

const response = await fetch("https://rev1-backend.onrender.com/api/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: text })
});

        // ----------------------------------------------------
        // Verifica HTTP
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                `Servidor retornou HTTP ${response.status}`
            );
        }


        // ----------------------------------------------------
        // Converte resposta para JSON
        // ----------------------------------------------------

        const data = await response.json();

        console.log("Resposta recebida do REV1:", data);


        // ----------------------------------------------------
        // Remove carregamento
        // ----------------------------------------------------

        removeLoading(loadingId);


        // ----------------------------------------------------
        // Aceita diferentes nomes de resposta
        // ----------------------------------------------------

        const reply =
            data.reply ??
            data.response ??
            data.answer ??
            data.message ??
            data.result;


        // ----------------------------------------------------
        // Verifica se a IA realmente respondeu
        // ----------------------------------------------------

        if (reply !== undefined && reply !== null) {

            appendMessage(
                String(reply),
                "bot"
            );

        } else {

            console.warn(
                "O backend respondeu, mas não encontrou o campo da resposta:",
                data
            );

            appendMessage(
                "O servidor REV1 respondeu, mas não retornou o texto esperado da IA.",
                "bot"
            );
        }


    } catch (error) {

        // ----------------------------------------------------
        // Remove carregamento
        // ----------------------------------------------------

        removeLoading(loadingId);


        console.error(
            "Erro de conexão com o backend REV1:",
            error
        );


        // ----------------------------------------------------
        // Mensagem amigável ao usuário
        // ----------------------------------------------------

        appendMessage(
            "Desculpe, não consegui conectar ao servidor de inteligência artificial do REV1. Verifique se o backend Python está online.",
            "bot"
        );
    }
}


// ============================================================
// ADICIONA MENSAGEM NA JANELA DO CHAT
// ============================================================

function appendMessage(text, sender) {

    const chatWindow = document.getElementById("chatWindow");

    if (!chatWindow) {

        console.error(
            "Elemento #chatWindow não encontrado."
        );

        return;
    }


    const msgDiv = document.createElement("div");

    msgDiv.classList.add(
        "message",
        sender
    );


    // --------------------------------------------------------
    // Ícone
    // --------------------------------------------------------

    const iconClass =
        sender === "bot"
            ? "fa-robot"
            : "fa-user";


    // --------------------------------------------------------
    // Proteção contra HTML malicioso
    // --------------------------------------------------------

    let formattedText = escapeHTML(
        String(text)
    );


    // --------------------------------------------------------
    // Transforma URLs em links
    // --------------------------------------------------------

    formattedText = formattedText.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#00b4d8;text-decoration:underline;">$1</a>'
    );


    // --------------------------------------------------------
    // Quebras de linha
    // --------------------------------------------------------

    formattedText = formattedText.replace(
        /\n/g,
        "<br>"
    );


    // --------------------------------------------------------
    // Monta mensagem
    // --------------------------------------------------------

    msgDiv.innerHTML = `
        <div class="avatar">
            <i class="fa-solid ${iconClass}"></i>
        </div>

        <div class="bubble">
            ${formattedText}
        </div>
    `;


    // --------------------------------------------------------
    // Adiciona ao chat
    // --------------------------------------------------------

    chatWindow.appendChild(
        msgDiv
    );


    // --------------------------------------------------------
    // Scroll automático
    // --------------------------------------------------------

    chatWindow.scrollTop =
        chatWindow.scrollHeight;
}


// ============================================================
// INDICADOR DE CARREGAMENTO
// ============================================================

function appendLoading() {

    const chatWindow =
        document.getElementById("chatWindow");


    if (!chatWindow) {

        console.error(
            "Elemento #chatWindow não encontrado."
        );

        return null;
    }


    const id =
        "loading-" + Date.now();


    const loadingDiv =
        document.createElement("div");


    loadingDiv.id = id;


    loadingDiv.classList.add(
        "message",
        "bot"
    );


    loadingDiv.innerHTML = `
        <div class="avatar">
            <i class="fa-solid fa-robot"></i>
        </div>

        <div class="bubble">
            <em>Consultando a base de conhecimento Zucchetti...</em>
        </div>
    `;


    chatWindow.appendChild(
        loadingDiv
    );


    chatWindow.scrollTop =
        chatWindow.scrollHeight;


    return id;
}


// ============================================================
// REMOVE CARREGAMENTO
// ============================================================

function removeLoading(id) {

    if (!id) {
        return;
    }


    const element =
        document.getElementById(id);


    if (element) {
        element.remove();
    }
}


// ============================================================
// PROTEÇÃO DE TEXTO
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent = text;


    return div.innerHTML;
}


// ============================================================
// TESTE DO BACKEND
// ============================================================

async function testarBackend() {

    try {

        console.log(
            "Testando conexão com o backend REV1..."
        );


        const response = await fetch(
            "/api/health",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "BACKEND REV1 ONLINE:",
            data
        );


        return true;

    } catch (error) {

        console.error(
            "BACKEND REV1 OFFLINE:",
            error
        );


        return false;
    }
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "REV1 - Assistente Virtual iniciado."
        );

        console.log(
            "Endpoint da API:",
            API_URL
        );

    }
);