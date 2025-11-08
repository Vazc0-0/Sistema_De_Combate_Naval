# Servidor HTTP simples com criptografia César (sem bibliotecas externas)
import json
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler

CHAVE = 7  # deslocamento da cifra de César

def cifra_cesar_criptografar(texto):
    if not texto:
        return ""
    resultado = []
    for ch in texto:
        codigo = ord(ch)
        if 65 <= codigo <= 90:           # A-Z
            resultado.append(chr(((codigo - 65 + CHAVE) % 26) + 65))
        elif 97 <= codigo <= 122:        # a-z
            resultado.append(chr(((codigo - 97 + CHAVE) % 26) + 97))
        elif 48 <= codigo <= 57:         # 0-9
            resultado.append(chr(((codigo - 48 + CHAVE) % 10) + 48))
        else:
            resultado.append(ch)
    etiqueta = f"[ENCRYPTED-MB-{str(int(time.time()*1000))[-4:]}]"
    return f"{etiqueta}{''.join(resultado)}[END-ENC]"

def cifra_cesar_descriptografar(texto_criptografado):
    if not texto_criptografado:
        return ""
    # remover etiqueta se existir
    inicio_tag = "[ENCRYPTED-MB-"
    if inicio_tag in texto_criptografado and "[END-ENC]" in texto_criptografado:
        try:
            corpo = texto_criptografado.split("]", 1)[1]  # remove a primeira tag inclusive o ]
            corpo = corpo.replace("[END-ENC]", "")
        except Exception:
            corpo = texto_criptografado
    else:
        corpo = texto_criptografado

    resultado = []
    for ch in corpo:
        codigo = ord(ch)
        if 65 <= codigo <= 90:
            resultado.append(chr(((codigo - 65 - CHAVE + 26) % 26) + 65))
        elif 97 <= codigo <= 122:
            resultado.append(chr(((codigo - 97 - CHAVE + 26) % 26) + 97))
        elif 48 <= codigo <= 57:
            resultado.append(chr(((codigo - 48 - CHAVE + 10) % 10) + 48))
        else:
            resultado.append(ch)
    return ''.join(resultado)

class ManipuladorCripto(SimpleHTTPRequestHandler):
    def do_POST(self):
        print("DEBUG: POST recebido em", self.path)
        tamanho = int(self.headers.get('Content-Length', 0))
        corpo_bytes = self.rfile.read(tamanho)
        print("DEBUG: body (bytes):", corpo_bytes)
        try:
            dados = json.loads(corpo_bytes.decode('utf-8'))
            print("DEBUG: JSON recebido:", dados)
        except Exception as e:
            print("DEBUG: erro ao decodificar JSON:", e)
            self.send_response(400)
            self.end_headers()
            return

        if self.path == "/encrypt":
            mensagem = dados.get('message', '')
            print("DEBUG: encrypt -> mensagem:", mensagem)
            resultado = cifra_cesar_criptografar(mensagem)
            resposta = { "encrypted": resultado }
        elif self.path == "/decrypt":
            cript = dados.get('encrypted', '')
            print("DEBUG: decrypt -> encrypted:", cript)
            resultado = cifra_cesar_descriptografar(cript)
            resposta = { "decrypted": resultado }
        else:
            print("DEBUG: rota não suportada:", self.path)
            self.send_response(404)
            self.end_headers()
            return

        resp_bytes = json.dumps(resposta).encode('utf-8')
        print("DEBUG: resposta a enviar:", resposta)
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(resp_bytes)))
        self.end_headers()
        self.wfile.write(resp_bytes)

if __name__ == "__main__":
    PORTA = 8000
    print(f"Servindo arquivos no diretório atual na porta {PORTA}. Abra http://localhost:{PORTA}/ no navegador.")
    servidor = HTTPServer(("0.0.0.0", PORTA), ManipuladorCripto)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("Servidor encerrado pelo usuário.")
        servidor.server_close()