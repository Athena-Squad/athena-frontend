# 🏋️‍♂️ Athena - Sistema de Gestão Esportiva e Evolução Física

> Um produto escalável desenvolvido para modernizar e centralizar o acompanhamento de treinos em academias e consultorias esportivas.

## 📌 Sobre o Projeto
O mercado de academias e *personal trainers* sofre frequentemente com a desorganização de dados, utilizando papéis, planilhas avulsas e mensagens de texto para gerenciar fichas de treino. 

O **Athena** nasce com o objetivo de solucionar essa dor real, oferecendo uma plataforma centralizada onde professores podem prescrever treinos e alunos podem registrar a execução diária, gerando um histórico seguro e métricas de evolução.

## 🚀 Funcionalidades do MVP (Produto Mínimo Viável)
- **Gestão de Perfis:** Autenticação e divisão de permissões (Professor vs. Aluno).
- **Prescrição de Treinos:** Interface para criação de fichas com exercícios, séries e repetições.
- **Registro de Execução:** Painel interativo para o aluno marcar treinos concluídos e registrar frequência.

## 🛠️ Stack Tecnológica
O projeto foi desenhado seguindo boas práticas de Engenharia de Software, utilizando uma arquitetura baseada em APIs REST e separação de responsabilidades (Front-end e Back-end).

**Front-end:**
- HTML5, CSS3 e JavaScript
- Deploy Contínuo: Vercel

**Back-end & Infraestrutura:**
- Java 17+ com Spring Boot
- Banco de Dados: PostgreSQL (Supabase)
- Deploy da API: Railway

## ⚙️ Como Executar Localmente
Para clonar e rodar este projeto em sua máquina, você precisará do [Git](https://git-scm.com), [Java JDK 17+](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) e uma IDE de sua preferência (IntelliJ, VS Code, Eclipse).

```bash
# Clone este repositório
$ git clone [https://github.com/athena-squad/athena-backend.git](https://github.com/athena-squad/athena-backend.git)

# Acesse a pasta do projeto no terminal/cmd
$ cd athena-backend

# O projeto rodará na porta:8080
