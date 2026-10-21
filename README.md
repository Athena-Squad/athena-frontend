# 🏋️‍♂️ Athena - Sistema de Gestão Esportiva e Evolução Física

> Um produto escalável desenvolvido para modernizar e centralizar o acompanhamento de treinos em academias e consultorias esportivas.

## 📌 Sobre o Projeto
O mercado de academias e *personal trainers* sofre frequentemente com a desorganização de dados, utilizando papéis, planilhas avulsas e mensagens de texto para gerenciar fichas de treino. 

O **Athena** nasce com o objetivo de solucionar essa dor real, oferecendo uma plataforma centralizada onde professores podem prescrever treinos e alunos podem registrar a execução diária, gerando um histórico seguro e métricas de evolução.

## 🚀 Funcionalidades do MVP (Produto Mínimo Viável)
- **Gestão de Perfis:** Autenticação e divisão de permissões (Professor vs. Aluno).
- **Prescrição de Treinos:** Interface para criação de fichas com exercícios, séries e repetições.
- **Registro de Execução:** Painel interativo para o aluno marcar treinos concluídos e registrar frequência.

## 🛠️ Stack Tecnológica e Arquitetura
O projeto adotou uma arquitetura ágil **Serverless/BaaS (Backend as a Service)**, eliminando a necessidade de uma API intermediária tradicional e delegando a regra de negócios de segurança diretamente para o banco de dados.

**Front-end (Client-Side):**
- HTML5, CSS3 e JavaScript (Vanilla)
- Padrão de Módulos (ES Modules)
- Hospedagem e CI/CD: **Vercel**

**Back-end & Segurança (BaaS):**
- **Supabase** (PostgreSQL Gerenciado)
- Autenticação nativa (Supabase Auth)
- Controle de acesso via **RLS (Row Level Security)**

## ⚙️ Como Executar Localmente
Para clonar e rodar este projeto em sua máquina, você precisará apenas do [Git](https://git-scm.com), de uma IDE como o **VS Code**, e da extensão **Live Server**.

```bash
# Clone este repositório
$ git clone https://github.com/athena-squad/athena-frontend.git

# Acesse a pasta do projeto
$ cd athena-frontend
```

**Importante:** Como o projeto utiliza o padrão de importação de módulos do JavaScript (`type="module"`), não é possível abrir o arquivo `index.html` com um duplo-clique comum. 
1. Abra a pasta no **VS Code**.
2. Clique no botão **"Go Live"** no canto inferior direito (Extensão Live Server).
3. O projeto rodará em `http://127.0.0.1:5500`.

## 👨‍💻 Autores e Contribuições
Este projeto está sendo desenvolvido em Sprints ágeis pela equipe de Engenharia.
* **UI/UX e Telas:** Prototipação e design de interfaces implementados por Danilo.
* **Arquitetura e Refatoração:** Migração para BaaS e padronização estrutural lideradas pelo Tech Lead (Sandro).