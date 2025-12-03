# consulta.py
import requests
import csv
import os
import re
import sys
from datetime import datetime

VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/"

def validar_cep(cep):
    cep = re.sub(r'\D', '', cep)  # remove tudo que não for número
    if len(cep) != 8:
        return None
    return cep

def consultar_cep(cep):
    url = VIACEP_URL.format(cep=cep)
    try:
        resp = requests.get(url, timeout=7)
    except requests.RequestException:
        print("❌ Erro de rede ao acessar a API.")
        return None

    if resp.status_code != 200:
        print(f"❌ Erro HTTP: {resp.status_code}")
        return None

    data = resp.json()
    if data.get("erro"):
        return "NAO_EXISTE"

    return {
        "cep": data.get("cep"),
        "logradouro": data.get("logradouro"),
        "bairro": data.get("bairro"),
        "cidade": data.get("localidade"),
        "estado": data.get("uf"),
        "consultado_em": datetime.utcnow().isoformat()
    }

def salvar_csv(dados, arquivo="consultas.csv"):
    existe = os.path.isfile(arquivo)
    fieldnames = ["cep", "logradouro", "bairro", "cidade", "estado", "consultado_em"]

    with open(arquivo, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not existe:
            writer.writeheader()
        writer.writerow({k: dados.get(k, "") for k in fieldnames})

def main():
    print("=== Consulta de CEP via API (ViaCEP) ===")

    while True:
        cep_raw = input("Digite o CEP (apenas números): ").strip()
        cep = validar_cep(cep_raw)

        if not cep:
            print("❌ CEP inválido! Digite exatamente 8 números.\n")
            continue

        resultado = consultar_cep(cep)

        if resultado == "NAO_EXISTE":
            print("❌ Este CEP **não existe** na base do ViaCEP.\nTente outro.\n")
            continue

        if resultado:
            print("\nResultado da busca:")
            for key in ["cep", "logradouro", "bairro", "cidade", "estado"]:
                print(f"{key.capitalize()}: {resultado.get(key) or ''}")
            salvar_csv(resultado)
            print("\n✅ Consulta salva em consultas.csv")
            break

if __name__ == "__main__":
    main()
