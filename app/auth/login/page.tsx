import NextLink from "next/link";
import {
  Alert,
  Button,
  Card,
  Field,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { login, loginWithGithub } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="lg">Connexion</Heading>
        <Text color="fg.muted">Accédez à votre compte</Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="5">
          {error ? (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Échec de connexion</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : null}

          <form action={login}>
            <Stack gap="3">
              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input name="email" type="email" />
              </Field.Root>
              <Field.Root required>
                <Field.Label>Mot de passe</Field.Label>
                <Input name="password" type="password" />
              </Field.Root>
              <Button type="submit">Se connecter</Button>
            </Stack>
          </form>

          <form action={loginWithGithub}>
            <Button variant="outline" type="submit" w="full">
              Continuer avec GitHub
            </Button>
          </form>

          <Text fontSize="sm" color="fg.muted">
            Pas encore de compte ?{" "}
            <Link asChild>
              <NextLink href="/auth/register">Créer un compte</NextLink>
            </Link>
          </Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
