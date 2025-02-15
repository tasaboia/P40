# 40 Dias de Oração

## 📖 Sobre o Projeto

O **40 Dias de Oração** é uma plataforma para organizar turnos de oração em diferentes fusos horários.

## 🚀 Tecnologias Utilizadas

- **Frontend:** Next.js, ShadCN, Tailwind CSS
- **Estado Global:** Zustand, React Query
- **Backend:** API Routes do Next.js, PostgreSQL com Prisma, NextAuth.js para autenticação
- **Monitoramento:** Sentry
- **Hospedagem:** Vercel e Neon

## 🔧 Como Configurar o Projeto

### 1️⃣ Clone o repositório

```sh
git clone https://github.com/seu-usuario/40-dias-oracao.git
cd 40-dias-oracao
```

### 2️⃣ Instale as dependências

```sh
npm install
```

### 3️⃣ Configure as variáveis de ambiente

Crie um arquivo `.env.local` baseado no modelo abaixo:

```env
DATABASE_URL="postgresql://usuario:senha@neon.tech/banco"
NEXTAUTH_SECRET="sua-chave-secreta"
```

### 4️⃣ Execute as migrações do banco de dados

```sh
npx prisma migrate dev
```

### 5️⃣ Inicie o servidor localmente

```sh
npm run dev
```

Acesse: **[http://localhost:3000](http://localhost:3000)**

## 🚀 Deploy

Para fazer o deploy na **Vercel**, rode:

```sh
vercel
```

Para conectar o banco de dados **Neon**, configure as credenciais na Vercel.

---

### 📌 **Contribuições**

Sinta-se livre para contribuir enviando um **Pull Request** ou abrindo uma **Issue**. 🙌

✉️ **Contato:** [tainasaboia@gmail.com](mailto:tainasaboia@gmail.com)

🛠 **Criado com Next.js, Prisma e muito mais!** 🚀
