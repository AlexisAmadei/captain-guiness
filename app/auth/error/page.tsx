import { Alert, Box, Heading, Text } from "@chakra-ui/react";

export default function AuthErrorPage() {
  return (
    <Box>
      <Heading size="lg" mb="4">
        Authentification échouée
      </Heading>
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Impossible de terminer la connexion</Alert.Title>
          <Alert.Description>
            Réessayez la connexion ou l&apos;inscription.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <Text mt="4" color="fg.muted">
        Vérifiez aussi votre configuration OAuth et les URLs de redirection Supabase.
      </Text>
    </Box>
  );
}
