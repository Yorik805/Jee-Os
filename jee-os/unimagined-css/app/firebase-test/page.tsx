"use client"

import { useEffect } from "react"
import { loginAnon } from "@/lib/firebase"

export default function Page() {
  useEffect(() => {
    loginAnon().then((user) => {
      console.log("User ID:", user.uid)
    })
  }, [])

  return <div>Firebase Connected</div>
}