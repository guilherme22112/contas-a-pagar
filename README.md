# Sistema de Contas a Pagar e Receber

Este é um projeto construído em Java com Spring Boot para gerenciamento de contas a pagar e receber. O sistema foi projetado para ser simples de rodar, pois já inclui o banco de dados embutido (SQLite) e o empacotador do Maven (Maven Wrapper).

## Pré-requisitos

Para rodar este projeto na sua máquina, você precisa ter instalado apenas:
- **Java Development Kit (JDK) 21 LTS**
- O **Git** (caso queira clonar o repositório)

*Não é necessário instalar o Maven ou configurar um banco de dados externo, pois o projeto já traz tudo configurado.*

## Instruções completas para execução

Siga este passo a passo simples para rodar a aplicação:

**1. Clone o repositório (ou extraia os arquivos do projeto na sua máquina)**
Abra o terminal e digite:
```bash
git clone https://github.com/caiojosegp/contas-pagar-receber.git
```

**2. Acesse a pasta do projeto**
```bash
cd contas-pagar-receber
```

**3. Execute a aplicação**
O projeto utiliza o Maven Wrapper (`mvnw`), que baixa automaticamente as dependências do Maven necessárias para rodar o projeto.

- **Se você usa Windows:**
  No prompt de comando ou PowerShell, digite:
  ```cmd
  mvnw.cmd spring-boot:run
  ```

- **Se você usa Linux ou macOS:**
  No terminal, digite:
  ```bash
  ./mvnw spring-boot:run
  ```

**4. Acesse o sistema e a documentação**
Pronto! A aplicação irá iniciar. Como o projeto possui a configuração do OpenAPI (Swagger), você pode visualizar e testar os endpoints da API diretamente pelo seu navegador.

Acesse: `http://localhost:8080/swagger-ui/index.html` (ou a porta correspondente configurada no seu arquivo `application.properties`).

## Banco de Dados

O projeto utiliza o **SQLite** como banco de dados (`cpr_database.sqlite`). Você não precisa criar tabelas manualmente, pois o sistema já usa o Flyway para criar e estruturar o banco de dados automaticamente assim que a aplicação é iniciada.
