"use client"
import { InputInline } from "@/components/ui/InputInline"
import { SelectBox } from "@/components/ui/SelectBox"
import { NavigationMenuDemo } from "@/components/ui/NavigationMenu"
import { useState } from "react"

export default function Chat() {
  const [input, setInput] = useState("")
  const [selectVal, setSelectVal] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "You are a helpful assistant"
    }
  ])

  async function sendMessage() {
    if (!input) return;

    const userMessage = {
      role: "user",
      content: input
    }

    const newMessages = [...messages, userMessage]
    setInput("")

    console.log(selectVal)
  
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: newMessages,
        model: selectVal,
      })
    })

    let fullText = ""
    const reader = res.body?.getReader()
    if(!reader) return

    const decoder = new TextDecoder()
    while(true){
      const {done, value} = await reader.read()
      if(done) return

      const chunk = decoder.decode(value)
      fullText += chunk
      setMessages([
      ...newMessages,
      {
        role: "assistant",
        content: fullText
      }
    ])
    } 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="absolute top-10">
        <NavigationMenuDemo />
      </div>
      <div className="absolute top-30 left-120">
        <SelectBox value={selectVal} onChange={setSelectVal}/>
      </div>  
      <div className="text-3xl font-bold">
        Jane returns!
      </div>
      <div className="m-10">
        <InputInline input={input} setInput={setInput} sendMessage={sendMessage}/>
      </div>
      <div className="space-y-4 mb-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-600 ml-12"
                  : "bg-zinc-800 mr-12"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
    </div>
  )
}