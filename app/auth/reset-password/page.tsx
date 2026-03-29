import {
  Alert,
  Button,
  Card,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { updatePassword } from "./actions";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { error } = await searchParams;

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="lg">Reset Password</Heading>
        <Text color="fg.muted">Choose a new password for your account.</Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="5">
          {error ? (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : null}

          <form action={updatePassword}>
            <Stack gap="3">
              <Field.Root required>
                <Field.Label>New password</Field.Label>
                <Input name="password" type="password" minLength={8} />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Confirm password</Field.Label>
                <Input name="confirmPassword" type="password" minLength={8} />
              </Field.Root>

              <Button type="submit">Update password</Button>
            </Stack>
          </form>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
