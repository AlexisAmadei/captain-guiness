import { Box, Container } from "@chakra-ui/react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box as="main" minH="100dvh" display="flex" alignItems="center">
      <Container maxW="md">{children}</Container>
    </Box>
  );
}
