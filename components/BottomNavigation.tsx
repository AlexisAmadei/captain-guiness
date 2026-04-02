"use client";

import { Box, Button, HStack, Icon, Text } from "@chakra-ui/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BiHome } from "react-icons/bi";

export function BottomNavigation() {
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTopWidth={1}
      borderColor="gray.200"
      shadow="md"
      zIndex={10}
      pb="env(safe-area-inset-bottom)"
    >
      <HStack
        h="16"
        px={4}
        justify="space-around"
        divideX="1px"
        divideColor="gray.200"
      >
        {/* Home */}
        <Button
          asChild
          flex={1}
          variant="ghost"
          flexDirection="column"
          gap={1}
          h="full"
          borderRadius={0}
          color="gray.600"
          _hover={{ color: "blue.600", bg: "transparent" }}
        >
          <Link href="/">
            <Icon fontSize="xl">
              <BiHome />
            </Icon>
            <Text fontSize="xs">Home</Text>
          </Link>
        </Button>

        {/* New */}
        <Button
          asChild
          flex={1}
          variant="ghost"
          flexDirection="column"
          gap={1}
          h="full"
          borderRadius={0}
          color="gray.600"
          _hover={{ color: "blue.600", bg: "transparent" }}
        >
          <Link href="/rate">
            <Icon fontSize="xl">
              <Plus size={20} />
            </Icon>
            <Text fontSize="xs">New</Text>
          </Link>
        </Button>

      </HStack>
    </Box>
  );
}
