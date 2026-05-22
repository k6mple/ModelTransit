"use client"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectBoxProps {
    value: string
    onChange: (val: string) => void
}
// 导出可复用的下拉框组件
export function SelectBox({value, onChange}: SelectBoxProps) {
  return (
    // 整个下拉框容器
    <Select value={value} onValueChange={onChange}>
      {/* 点击触发的按钮 */}
      <SelectTrigger className="w-[115px]">
        {/* 选中后显示的值 */}
        <SelectValue placeholder="Model" />
      </SelectTrigger>

      {/* 下拉弹出的内容 */}
      <SelectContent>
        <SelectGroup>
          {/* 分组标题 */}
          <SelectLabel>Model</SelectLabel>
          
          {/* 选项 */}
          <SelectItem value="ChatGPT">ChatGPT</SelectItem>
          <SelectItem value="Qwen">Qwen</SelectItem>
          <SelectItem value="deepseek-v4-flash">DeepSeek-V4-Flash</SelectItem>
          <SelectItem value="deepseek-v4-pro">DeepSeek-V4-Pro</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}