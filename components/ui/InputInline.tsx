import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type Props = {
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  sendMessage: () => void
}

export function InputInline({
  input, setInput, sendMessage
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <Field orientation="horizontal">
      <Input type="search" placeholder="Let's talk about something..."
        className="rounded-full h-11 min-w-[400px]"
        value={input}
        setInput={setInput}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault()
            sendMessage()
          }
        }} />
      <Button className="h-11 w-20 rounded-full font-bold" onClick={sendMessage}>Send</Button>
    </Field>
  )
}
