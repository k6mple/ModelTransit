import OpenAI from "openai"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userMessage = body.messages.at(-1)
    console.log(body)

    if (body.isNewChat) {
      const title = userMessage.content.slice(0, 40) + (userMessage.content.length > 40 ? "…" : "")
      await prisma.history.create({
        data: {
          id: body.chatId,
          title: title,
          date: body.date
        }
      })
      console.log("Succeed in creating history: ", body.chatId)
    }
    

    await prisma.message.create({
      data: {
        chatId: body.chatId,
        role: userMessage.role,
        content: userMessage.content,
      }
    })
    console.log("Succeeding in creating ", userMessage.role, "message in history: ", body.chatId)

    //Build output stream
    const stream = await openai.chat.completions.create({
      messages: body.messages,
      model: body.model,
      stream: true
    })

    const encoder = new TextEncoder()

    let fullResponse = ""

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ""
          fullResponse += text
          controller.enqueue(
            encoder.encode(text)
          )
        }
        controller.close()

        // 保存 assistant 回复到数据库
        await prisma.message.create({
          data: {
            chatId: body.chatId,
            role: "assistant",
            content: fullResponse,
          }
        })
        console.log(`Succeed in creating assistant message in history ${body.chatId}`)
      }
    })

    return new Response(readableStream)
  }
  catch (error) {
    console.error("backend crash", error)
    return Response.json({ error: "worng" })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const chatId = searchParams.get("chatId")
  if (chatId) {
    try {
      const messages = await prisma.message.findMany({
        where: {
          chatId: chatId
        },
        orderBy: {
          createdAt: "asc"
        }
      })
      console.log("Succeed in fetching corresponding messages")
      console.log(messages) 
      return NextResponse.json(messages)
    } catch (error) {
      console.log("Failed to fetch history messages", error)
      return NextResponse.json(error)
    }
  }

  try {
    const history = await prisma.history.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })
    console.log("Succeed in fetching chat history")
    console.log(history)
    return NextResponse.json(history)
  } catch (error) {
    console.log("Failed to fetch the history", error)
    return NextResponse.json(error)
  }
}