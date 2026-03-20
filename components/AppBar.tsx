"use client";

import { Box, Button, HStack, Icon, Menu, Portal, Text } from "@chakra-ui/react";
import Link from "next/link";
import { BiMenu } from "react-icons/bi";
import { logout } from "@/app/auth/login/actions";

type AppBarProps = {
  title?: string;
};

export function AppBar({ title = "Captain" }: AppBarProps) {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box
      position="sticky"
      top={0}
      bg="white"
      borderBottomWidth={1}
      borderColor="gray.200"
      shadow="sm"
      zIndex={10}
    >
      <HStack
        h="14"
        px={4}
        justify="space-between"
      >
        <Text fontSize="lg" fontWeight="bold" color="blue.600">
          {title}
        </Text>
        <Menu.Root positioning={{ placement: "bottom-end" }}>
          <Menu.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              borderRadius="full"
              p={0}
            >
              <Icon fontSize="lg" color="gray.600">
                <BiMenu />
              </Icon>
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="profile" asChild>
                  <Link href="/settings/profile">Profile</Link>
                </Menu.Item>
                <Menu.Item value="settings" asChild>
                  <Link href="/settings">Settings</Link>
                </Menu.Item>
                <Menu.Item value="logout" onClick={handleLogout} color="fg.error">
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </HStack>
    </Box>
  );
}
