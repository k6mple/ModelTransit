import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log(body)

    const stream = await openai.chat.completions.create({
      messages: body.messages,
      model: body.model,
      stream: true
    })

    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        for await(const chunk of stream){
          const text = chunk.choices[0]?.delta?.content || ""
          controller.enqueue(
            encoder.encode(text)
          )
        }
        controller.close()
      }
    })
    
    console.log(stream)
    return new Response(readableStream)
  }
  catch(error){
    console.error("backend crash", error)
    return Response.json({error: "worng"})
  }
}
