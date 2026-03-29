"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { EmotionCacheProvider } from "./emotion-cache"

export function Provider(props: ColorModeProviderProps) {
  return (
    <EmotionCacheProvider>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider {...props} />
      </ChakraProvider>
    </EmotionCacheProvider>
  )
}
