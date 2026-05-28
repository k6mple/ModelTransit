This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, make sure there is a database available on certain port. Make a file ".env" and add your database url in it so that prisma can make effects. And make a file ".env.local" and add your API_KEY into it.

```bash
npm install
npm install prisma
npx prisma generate
npx prisma migrate dev
```

Then, you can run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The index page is just a greeting page and it don't have particular function. You can go to /chat to converse with deepseek. Here is a web page and you can use it to talk with ai(only DeepSeek-v4 available now). Before send message, you must choose right model or it will send an error because model is "null". By using it, you can chat with edged ai(claude, chatgpt etc will also available soon) with a human-friendly user interface if you don't want to chat in a black old-fashioned terminal. The chat history and message will be stored in your local database. I recommend you use PostgreSql and I also test with PostgreSql.
