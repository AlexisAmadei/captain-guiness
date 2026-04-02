"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { EmotionCacheProvider } from "./emotion-cache"
import { system } from "./theme"

export function Provider(props: ColorModeProviderProps) {
  return (
    <EmotionCacheProvider>
      <ChakraProvider value={system}>
        <ColorModeProvider {...props} />
      </ChakraProvider>
    </EmotionCacheProvider>
  )
}
