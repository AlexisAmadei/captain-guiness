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
import { register } from "./actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="lg">Créer un compte</Heading>
        <Text color="fg.muted">Inscription par email et mot de passe</Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="5">
          {error ? (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Échec d&apos;inscription</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : null}

          <form action={register}>
            <Stack gap="3">
              <Field.Root required>
                <Field.Label>Nom complet</Field.Label>
                <Input name="fullName" type="text" />
              </Field.Root>
              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input name="email" type="email" />
              </Field.Root>
              <Field.Root required>
                <Field.Label>Mot de passe</Field.Label>
                <Input name="password" type="password" minLength={8} />
              </Field.Root>
              <Button type="submit">S&apos;inscrire</Button>
            </Stack>
          </form>

          <Text fontSize="sm" color="fg.muted">
            Déjà inscrit ?{" "}
            <Link asChild>
              <NextLink href="/auth/login">Se connecter</NextLink>
            </Link>
          </Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
