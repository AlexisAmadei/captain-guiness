"use client"

import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { useServerInsertedHTML } from "next/navigation"
import {
  type PropsWithChildren,
  useState,
} from "react"

type RegistryState = {
  cache: ReturnType<typeof createCache>
  flush: () => string[]
}

export function EmotionCacheProvider({ children }: PropsWithChildren) {
  const [{ cache, flush }] = useState<RegistryState>(() => {
    const cache = createCache({ key: "css" })
    cache.compat = true

    const prevInsert = cache.insert
    let inserted: string[] = []

    cache.insert = (...args) => {
      const serialized = args[1]

      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }

      return prevInsert(...args)
    }

    const flush = () => {
      const prevInserted = inserted
      inserted = []
      return prevInserted
    }

    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()

    if (names.length === 0) {
      return null
    }

    let styles = ""
    for (const name of names) {
      styles += cache.inserted[name]
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}