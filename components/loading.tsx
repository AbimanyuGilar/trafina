'use client'

import { Loader2 } from "lucide-react"

const Loading = ({ size } : {size?: number}) => {
  return (
    <Loader2 size={size} className="animate-spin text-white" />
  )
}

export default Loading