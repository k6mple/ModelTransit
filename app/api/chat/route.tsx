import OpenAI from "openai"
import { prisma } from "@/lib/prisma"
import { retrieveContext } from "@/lib/rag"
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

    // RAG: retrieve relevant context
    let messages = body.messages
    if (body.ragEnabled && userMessage?.content) {
      const context = retrieveContext(userMessage.content)
      if (context) {
        const ragPrompt = `你是一个基于知识库的问答助手。请仅根据以下检索到的文档内容回答问题。如果文档中没有相关信息，请如实说"文档中未找到相关信息"。

检索到的文档内容：
${context}`

        // replace or augment the system message
        const sysIdx = messages.findIndex((m: { role: string }) => m.role === "system")
        if (sysIdx >= 0) {
          messages = messages.map((m: { role: string; content: string }, i: number) =>
            i === sysIdx ? { ...m, content: m.content + "\n\n" + ragPrompt } : m
          )
        } else {
          messages = [{ role: "system", content: ragPrompt }, ...messages]
        }
      }
    }

    //Build output stream
    const stream = await openai.chat.completions.create({
      messages: messages,
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
      return NextResponse.json([], { status: 500 })
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
    return NextResponse.json([], { status: 500 })
  }
}

export async function DELETE(req: Request){
  const body = await req.json()
  try{
    await prisma.history.delete({
      where: {
        id: body.chatId
      }
    })
    console.log("Succeeding in deleting one history item, id: ", body.chatId)
  }catch(error){
    console.log(`Failed to delete history item,id: ${body.chatId}`, error)
  }
}