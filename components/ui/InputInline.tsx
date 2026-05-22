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

  return (
    <Field orientation="horizontal">
      <Input type="search" placeholder="Let's talk about something..."
        value={input}
        onChange={(e) => setInput(e.target.value)} />
      <Button className="h-12 w-20 rounded-full font-bold" onClick={sendMessage}>Send</Button>
    </Field>
  )
}
