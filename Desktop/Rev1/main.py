import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mapeia a pasta css para arquivos estáticos
app.mount("/css", StaticFiles(directory="css"), name="css")

# Base de Conhecimento Offline
BASE_CONHECIMENTO = {
    "zweb": "O Zweb é a plataforma em nuvem da Zucchetti para gestão financeira, PDV e controle de vendas online.",
    "clipp": "O Clipp é o sistema desktop completo da Zucchetti para gestão comercial, estoque e emissão de NFe/NFCe.",
    "zucchetti": "A Zucchetti é a empresa desenvolvedora dos sistemas Zweb e Clipp.",
    "suporte": "Para suporte técnico da revenda Rev1, entre em contato pelo WhatsApp (83) 99185-0358."
}

class ChatRequest(BaseModel):
    message: str

# Rota para servir a página principal
@app.get("/")
async def read_index():
    return FileResponse("index.html")

# Rota para servir arquivos da raiz (app.js, manifest.json, sw.js)
@app.get("/{file_name}")
async def read_file(file_name: str):
    if os.path.exists(file_name):
        return FileResponse(file_name)
    return FileResponse("index.html")

# Rota da Inteligência do Chat
@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    user_text = payload.message.lower().strip()
    
    # 1. Busca na base local (Offline)
    for chave, texto in BASE_CONHECIMENTO.items():
        if chave in user_text:
            return {"reply": texto}

    # 2. Busca na OpenAI (Se houver chave configurada e estiver Online)
    api_key_openai = os.getenv("OPENAI_API_KEY")
    if api_key_openai:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key_openai)
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Você é o assistente virtual da Revenda Zucchetti Rev1. Responda sobre Zweb e Clipp."},
                    {"role": "user", "content": payload.message}
                ]
            )
            return {"reply": completion.choices[0].message.content}
        except Exception as e:
            print(f"Erro OpenAI: {e}")

    # 3. Resposta Padrão
    return {
        "reply": "Não encontrei essa informação na minha base local. Tente perguntar sobre 'Zweb', 'Clipp' ou 'Suporte'."
    }
from fastapi.responses import FileResponse

@app.get("/")
async def read_index():
    return FileResponse("index.html") 