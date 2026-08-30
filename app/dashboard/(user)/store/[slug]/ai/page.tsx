'use client'

import React, { useState } from "react"
import { askGeminiAction } from "@/lib/ai/chat"

const page = () => {
  const [prompt, setPrompt] = useState('')

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" onChange={(e) => setPrompt(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default page