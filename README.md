## 📅 Agendar - Checklist Detalhado de Funcionalidades

---

### ✅ Autenticação e Recuperação de Senha (Dono do estabalecimento / Parceiro)

- [x] Cadastro de parceiros
- [x] Login de parceiros
- [ ] Recuperação de senha via email
- [x] Criar um estabelecimento padrão ao primeiro login

---

### 📊 Dashboard de Agendamentos

- [x] Listagem de todos os agendamentos
- [x] Filtrar agendamentos por período
- [x] Filtrar agendamentos por status
- [x] Filtrar agendamentos por profissional
- [x] Filtrar agendamentos por serviço
- [x] Implementar paginação de resultados

---

### 🌐 Página Pública da Loja (via Slug)

- [x] Listagem de serviços
- [x] Listagem de profissionais
- [x] Listagem de pacotes
- [x] Exibir informações da loja (nome, banner, logo, etc)

---

### 🛠️ Gestão de Serviços

- [x] Criar serviço
- [x] Listar serviços
- [x] Editar serviço
- [x] Excluir serviço
- [x] Ativar serviço
- [x] Desativar serviço

**Campos obrigatórios:**

- Nome
- Categoria
- Imagem
- Duração
- Valor

> Um serviço pode ter várias categorias.

---

### 🗂️ Gestão de Categorias

- [x] Criar categoria
- [x] Listar categorias
- [x] Editar categoria
- [x] Excluir categoria

**Campo:**

- Nome

> Uma categoria pode ter vários serviços.

---

### 👥 Gestão de Profissionais

- [x] Criar profissional
- [x] Listar profissionais
- [x] Editar profissional
- [x] Excluir profissional
- [x] Ativar profissional
- [x] Desativar profissional

**Campos obrigatórios:**

- Nome
- Telefone
- Email
- Endereço
- Foto
- Serviços que realiza (com comissão por serviço)
- Indisponibilidades (Exemplo: Domingo - 12:00 às 14:00)

---

### 👤 Gestão de Clientes

- [x] Criar cliente
- [x] Listar clientes
- [x] Editar cliente
- [x] Excluir cliente
- [x] Listar pacotes do cliente
- [ ] Excluir pacote de cliente
- [x] Listar histórico de agendamentos do cliente

**Campos obrigatórios:**

- Nome \*
- Telefone \*
- Aniversário \*
- Email
- CPF
- Endereço

---

### 🎁 Plano de Fidelidade

- [x] Listar planos de fidelidade
- [x] Editar plano de fidelidade
- [x] Excluir plano de fidelidade
- [x] Ativar plano
- [x] Desativar plano

**Campos:**

- Nome
- Serviço principal
- Serviço bônus
- Pontos por serviço
- Pontos necessários para o bônus
- Quantidade de bônus

---

### 📦 Pacotes de Serviços

- [x] Criar pacote
- [x] Listar pacotes
- [x] Editar pacote
- [x] Excluir pacote
- [x] Ativar pacote
- [x] Desativar pacote

**Campos:**

- Imagem
- Nome
- Serviço do pacote
- Quantidade de itens
- Valor por serviço
- Comissão
- Descrição

---

### 🏪 Configurações do Estabelecimento

- [x] Atualizar nome da loja
- [x] Atualizar slug
- [x] Atualizar telefone
- [x] Atualizar link do Google Maps
- [x] Atualizar endereço
- [x] Atualizar lista de serviços feitos
- [x] Atualizar lista de usuários ativos
- [x] Atualizar tempo de XP
- [x] Atualizar logo da loja
- [x] Atualizar banner da loja
- [x] Atualizar texto "Sobre nós"
- [x] Atualizar tema da loja (exemplo: "blue", "green", etc)
- [x] Atualizar horário de funcionamento (Exemplo: Domingo - 08:00 às 18:00)
- [x] Atualizar intervalos de funcionamento (Exemplo: Domingo - 12:00 às 13:00)

---

### 📲 Comunicação com Clientes

- [ ] Envio de mensagens por WhatsApp
- [ ] Envio de push notifications (notificações no app)
- [ ] Criar templates de mensagens
- [ ] Permitir envio manual
- [ ] Permitir envio automatizado (Exemplo: lembrete de agendamento)

---

### 📅 Fluxo de Agendamento

#### Fluxo a partir do serviço:

- [x] Listar profissionais que realizam o serviço

#### Fluxo a partir do profissional:

- [x] Listar serviços que o profissional realiza

#### Continuação dos fluxos:

- [x] Listar horários disponíveis a partir da data enviada
- [x] Verificar cadastro do cliente a partir do número de telefone
- [x] Verificar se o cliente possui pacote ativo (verificar com base no serviço e cliente)
- [x] Criar agendamento
- [ ] Realizar o agendamento

---

### 💳 Planos de Assinatura para Usuários Primários (Admin da Loja)

#### Períodos de Cobrança:

- Mensal
- Semestral (10% de desconto)
- Anual (20% de desconto)
- Todos com 7 dias de teste grátis

#### Faixas de Preço por Número de Profissionais:

| Profissionais             | Mensal | Semestral (10% OFF) | Anual (20% OFF) |
| ------------------------- | ------ | ------------------- | --------------- |
| 01 profissional           | 79,90  | 71,91               | 63,92           |
| 2 a 7 profissionais       | 99,70  | 89,73               | 79,76           |
| 8 a 15 profissionais      | 164,90 | 148,41              | 131,92          |
| Acima de 15 profissionais | 219,90 | 197,91              | 175,92          |

#### Funcionalidades de Plano:
- [x] Crud dos planos  
- [x] Criar gestão de planos ativos por estabelecimento
- [!] Criar lógica de limite de usuários/profissionais por plano
- [x] Implementar controle de período de trial (7 dias grátis)
- [x] Implementar cobrança e faturamento
- [ ] Criar tela para upgrade/downgrade de plano
