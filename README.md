🔎 Consulta de CEP via API (Python + CSV)

Este projeto demonstra como consumir uma API pública, validar dados, exibir informações ao usuário e registrar tudo em um arquivo CSV.

🚀 Funcionalidades

Consulta de CEP usando a API pública ViaCEP

Validação automática do CEP (remove caracteres e aceita apenas 8 dígitos)

Mensagens de erro amigáveis

Repetição automática até que um CEP válido seja informado

Exibição organizada das informações retornadas

Registro de cada consulta em consultas.csv

Geração automática do cabeçalho do CSV (somente na primeira execução)

📁 Estrutura do Projeto
projeto_consulta_api/
│
├── consulta.py       # Código-fonte do sistema
├── consultas.csv     # Gerado automaticamente após a primeira consulta
└── README.md         # Documentação do projeto

🛠 Tecnologias Utilizadas

Python 3

Requests (para fazer requisições HTTP)

CSV (manipulação de planilhas)

ViaCEP API

📥 Como Executar

Instale o Python 3
https://www.python.org/downloads/

Instale a biblioteca necessária:

pip install requests


Execute o programa:

python consulta.py


Digite um CEP válido (ex: 01001000)

📊 Exemplo de Saída
=== Consulta de CEP via API (ViaCEP) ===
Digite o CEP (apenas números): 01001000

Resultado da busca:
Cep: 01001-000
Logradouro: Praça da Sé
Bairro: Sé
Cidade: São Paulo
Estado: SP

Consulta salva em consultas.csv

🧾 Sobre o Arquivo CSV

O arquivo consultas.csv é gerado automaticamente e contém:

cep

logradouro

bairro

cidade

estado

consultado_em (data/hora da consulta)

Cada nova consulta adiciona uma nova linha sem apagar dados anteriores.

🎯 Objetivo do Projeto

Este projeto reforça habilidades essenciais e muito valorizadas no mercado:

Consumo e integração com APIs

Manipulação de arquivos CSV

Lógica de programação em Python

Tratamento de erros

Documentação profissional para GitHub