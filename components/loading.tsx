import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: number
  className?: string
}

const Loading = ({ size = 16, className }: LoadingProps) => {
  return (
    <Loader2 size={size} className={cn("animate-spin", className)} />
  )
}

export default Loading