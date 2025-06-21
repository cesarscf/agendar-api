## 📅 Agendar - Checklist Detalhado de Funcionalidades

---

### ✅ Autenticação e Recuperação de Senha (Dono do estabalecimento / Parceiro)

- [ ] Cadastro de parceiros
- [ ] Login de parceiros
- [ ] Recuperação de senha via email
- [ ] Criar um estabelecimento padrão ao primeiro login

---

### 📊 Dashboard de Agendamentos

- [ ] Listagem de todos os agendamentos
- [ ] Filtrar agendamentos por período
- [ ] Filtrar agendamentos por status
- [ ] Filtrar agendamentos por profissional
- [ ] Filtrar agendamentos por serviço
- [ ] Implementar paginação de resultados

---

### 🌐 Página Pública da Loja (via Slug)

- [ ] Listagem de serviços
- [ ] Listagem de profissionais
- [ ] Listagem de pacotes
- [ ] Exibir informações da loja (nome, banner, logo, etc)

---

### 🛠️ Gestão de Serviços

- [ ] Criar serviço
- [ ] Listar serviços
- [ ] Editar serviço
- [ ] Excluir serviço
- [ ] Ativar serviço
- [ ] Desativar serviço

**Campos obrigatórios:**

- Nome
- Categoria
- Imagem
- Duração
- Valor

> Um serviço pode ter várias categorias.

---

### 🗂️ Gestão de Categorias

- [ ] Criar categoria
- [ ] Listar categorias
- [ ] Editar categoria
- [ ] Excluir categoria

**Campo:**

- Nome

> Uma categoria pode ter vários serviços.

---

### 👥 Gestão de Profissionais

- [ ] Criar profissional
- [ ] Listar profissionais
- [ ] Editar profissional
- [ ] Excluir profissional
- [ ] Ativar profissional
- [ ] Desativar profissional

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

- [ ] Criar cliente
- [ ] Listar clientes
- [ ] Editar cliente
- [ ] Excluir cliente
- [ ] Listar pacotes do cliente
- [ ] Excluir pacote de cliente
- [ ] Listar histórico de agendamentos do cliente

**Campos obrigatórios:**

- Nome \*
- Telefone \*
- Aniversário \*
- Email
- CPF
- Endereço

---

### 🎁 Plano de Fidelidade

- [ ] Criar plano de fidelidade
- [ ] Listar planos de fidelidade
- [ ] Editar plano de fidelidade
- [ ] Excluir plano de fidelidade
- [ ] Ativar plano
- [ ] Desativar plano

**Campos:**

- Nome
- Serviço principal
- Serviço bônus
- Pontos por serviço
- Pontos necessários para o bônus
- Quantidade de bônus

---

### 📦 Pacotes de Serviços

- [ ] Criar pacote
- [ ] Listar pacotes
- [ ] Editar pacote
- [ ] Excluir pacote
- [ ] Ativar pacote
- [ ] Desativar pacote

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

- [ ] Atualizar nome da loja
- [ ] Atualizar slug
- [ ] Atualizar telefone
- [ ] Atualizar link do Google Maps
- [ ] Atualizar endereço
- [ ] Atualizar lista de serviços feitos
- [ ] Atualizar lista de usuários ativos
- [ ] Atualizar tempo de XP
- [ ] Atualizar logo da loja
- [ ] Atualizar banner da loja
- [ ] Atualizar texto "Sobre nós"
- [ ] Atualizar tema da loja (exemplo: "blue", "green", etc)
- [ ] Atualizar horário de funcionamento (Exemplo: Domingo - 08:00 às 18:00)
- [ ] Atualizar intervalos de funcionamento (Exemplo: Domingo - 12:00 às 13:00)

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

- [ ] Listar profissionais que realizam o serviço

#### Fluxo a partir do profissional:

- [ ] Listar serviços que o profissional realiza

#### Continuação dos fluxos:

- [ ] Listar horários disponíveis a partir da data enviada
- [ ] Verificar cadastro do cliente a partir do número de telefone
- [ ] Verificar se o cliente possui pacote ativo (verificar com base no serviço e cliente)
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

- [ ] Criar gestão de planos ativos por estabelecimento
- [ ] Criar lógica de limite de usuários/profissionais por plano
- [ ] Implementar controle de período de trial (7 dias grátis)
- [ ] Implementar cobrança e faturamento
- [ ] Criar tela para upgrade/downgrade de plano
