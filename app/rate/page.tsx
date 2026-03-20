"use client";

import { Box, Button, Container, Dialog, Field, Heading, HStack, Input, Portal, Spinner, Stack, Text, Textarea } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";
import { LocationPinPicker } from "@/components/LocationPinPicker";
import { PhotoCapture } from "@/components/PhotoCapture";
import { StarRating } from "@/components/StarRating";
import { compressImage } from "@/lib/compression";
import { useGeolocation } from "@/hooks/useGeolocation";

type RatingCriteria = {
  overall: number;
  taste: number;
  foam: number;
  creamy: number;
  temperature: number;
  presentation: number;
  valueForMoney: number;
};

function isValidOptionalRating(value: number) {
  if (value === 0) return true;
  if (value < 1 || value > 5) return false;
  return Number.isInteger(value * 2);
}

async function getResponseErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export default function RatePage() {
  const router = useRouter();
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();

  const [criteria, setCriteria] = useState<RatingCriteria>({
    overall: 0,
    taste: 0,
    foam: 0,
    creamy: 0,
    temperature: 0,
    presentation: 0,
    valueForMoney: 0,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [barName, setBarName] = useState("");
  const [comment, setComment] = useState("");
  const [pintPrice, setPintPrice] = useState("");
  const [manualCoordinates, setManualCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedAutoLatitude =
    typeof latitude === "number" && Number.isFinite(latitude) ? latitude : null;
  const normalizedAutoLongitude =
    typeof longitude === "number" && Number.isFinite(longitude) ? longitude : null;

  const selectedLatitude = normalizedAutoLatitude ?? manualCoordinates?.latitude ?? null;
  const selectedLongitude = normalizedAutoLongitude ?? manualCoordinates?.longitude ?? null;
  const hasValidSelectedCoordinates =
    selectedLatitude !== null &&
    selectedLongitude !== null &&
    Number.isFinite(selectedLatitude) &&
    Number.isFinite(selectedLongitude);

  const maxCommentLength = 500;

  const handlePhotoCapture = (file: File) => {
    setPhotoFile(file);
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (criteria.overall === 0) {
      setError("Overall rating is required");
      return;
    }

    if (!Number.isInteger(criteria.overall * 2)) {
      setError("Overall rating must use half-star increments");
      return;
    }

    const optionalCriteria = [
      criteria.taste,
      criteria.foam,
      criteria.creamy,
      criteria.temperature,
      criteria.presentation,
      criteria.valueForMoney,
    ];

    if (!optionalCriteria.every(isValidOptionalRating)) {
      setError("Optional criteria must be empty or between 1 and 5 in 0.5 steps");
      return;
    }

    if (!photoFile) {
      setError("Please take a photo");
      return;
    }

    if (comment.length > maxCommentLength) {
      setError(`Comment cannot exceed ${maxCommentLength} characters`);
      return;
    }

    const trimmedBarName = barName.trim();
    if (trimmedBarName.length > 120) {
      setError("Nom du bar cannot exceed 120 characters");
      return;
    }

    const parsedPrice = pintPrice.trim() === "" ? null : Number(pintPrice);
    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setError("Pint price must be a positive number");
      return;
    }

    if (selectedLatitude === null || selectedLongitude === null) {
      setError("Location unavailable. Place a pin on the map to continue.");
      return;
    }

    if (!Number.isFinite(selectedLatitude) || !Number.isFinite(selectedLongitude)) {
      setError("Invalid location received from device. Please place a pin manually.");
      return;
    }

    setLoading(true);

    try {
      // Compress the image
      const compressedPhoto = await compressImage(photoFile);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", compressedPhoto);
      formData.append("latitude", String(selectedLatitude));
      formData.append("longitude", String(selectedLongitude));

      // Upload the image
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(await getResponseErrorMessage(uploadResponse, "Failed to upload image"));
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData || typeof uploadData.url !== "string" || uploadData.url.trim().length === 0) {
        throw new Error("Upload response is missing the image URL");
      }
      const imageUrl = uploadData.url;

      // Submit the rating
      const ratingResponse = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallRating: criteria.overall,
          tasteRating: criteria.taste || null,
          foamRating: criteria.foam || null,
          creamyRating: criteria.creamy || null,
          temperatureRating: criteria.temperature || null,
          presentationRating: criteria.presentation || null,
          valueForMoneyRating: criteria.valueForMoney || null,
          barName: trimmedBarName || null,
          comment,
          pintPrice: parsedPrice,
          ratedAt: new Date().toISOString(),
          photoUrl: imageUrl,
          latitude: selectedLatitude,
          longitude: selectedLongitude,
        }),
      });

      if (!ratingResponse.ok) {
        throw new Error(await getResponseErrorMessage(ratingResponse, "Failed to submit rating"));
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (geoLoading) {
    return (
      <Container maxW="container.sm" py={8}>
        <Stack align="center" gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text>Loading your location...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="container.sm" py={8}>
      <Stack gap={8}>
        <Heading as="h1" size="lg">
          Rate a place
        </Heading>

        {geoError && (
          <Box bg="red.50" p={4} borderRadius="md" borderLeft="4px" borderColor="red.500">
            <Text color="red.700">{geoError}</Text>
          </Box>
        )}

        {error && (
          <Box bg="red.50" p={4} borderRadius="md" borderLeft="4px" borderColor="red.500">
            <Text color="red.700">{error}</Text>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            {/* Bar Name */}
            <Field.Root>
              <Field.Label>Nom du bar</Field.Label>
              <Input
                placeholder="Ex: Le Vieux Port"
                value={barName}
                maxLength={120}
                onChange={(e) => setBarName(e.target.value)}
              />
            </Field.Root>

            {/* General Rating */}
            <Field.Root required>
              <Field.Label>
                Note générale <Field.RequiredIndicator />
              </Field.Label>
              <StarRating
                value={criteria.overall}
                onChange={(value) => setCriteria((prev) => ({ ...prev, overall: value }))}

              />
            </Field.Root>

            {/* 5 Optional Criteria */}
            <Field.Root>
              <Field.Label>Goût (optionnel)</Field.Label>
              <StarRating
                value={criteria.taste}
                onChange={(value) => setCriteria((prev) => ({ ...prev, taste: value }))}

              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Mousse (optionnel)</Field.Label>
              <StarRating
                value={criteria.foam}
                onChange={(value) => setCriteria((prev) => ({ ...prev, foam: value }))}

              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Crémeuse (optionnel)</Field.Label>
              <StarRating
                value={criteria.creamy}
                onChange={(value) => setCriteria((prev) => ({ ...prev, creamy: value }))}

              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Température (optionnel)</Field.Label>
              <StarRating
                value={criteria.temperature}
                onChange={(value) => setCriteria((prev) => ({ ...prev, temperature: value }))}

              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Présentation (optionnel)</Field.Label>
              <StarRating
                value={criteria.presentation}
                onChange={(value) => setCriteria((prev) => ({ ...prev, presentation: value }))}

              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Rapport qualité/prix (optionnel)</Field.Label>
              <StarRating
                value={criteria.valueForMoney}
                onChange={(value) => setCriteria((prev) => ({ ...prev, valueForMoney: value }))}

              />
            </Field.Root>

            {/* Photo Capture */}
            <Field.Root required>
              <Field.Label>
                Photo <Field.RequiredIndicator />
              </Field.Label>
              <PhotoCapture onPhotoCapture={handlePhotoCapture} onClear={handleClearPhoto} />
            </Field.Root>

            {/* Comment */}
            <Field.Root>
              <Field.Label>Commentaire (optionnel)</Field.Label>
              <Textarea
                placeholder="Add any additional comments..."
                value={comment}
                maxLength={maxCommentLength}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                {comment.length}/{maxCommentLength}
              </Text>
            </Field.Root>

            {/* Pint Price */}
            <Field.Root>
              <Field.Label>Prix de la pinte (optionnel)</Field.Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="Ex: 7.50"
                value={pintPrice}
                onChange={(e) => setPintPrice(e.target.value)}
              />
            </Field.Root>

            {/* Location Display */}
            {hasValidSelectedCoordinates && (
              <Box bg="blue.50" p={4} borderRadius="md">
                <Text fontSize="sm" color="blue.700">
                  📍 Location: {selectedLatitude.toFixed(6)}, {selectedLongitude.toFixed(6)}
                </Text>
              </Box>
            )}

            {/* Submit Button */}
            <HStack gap={3}>
              <Button
                flex={1}
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                flex={1}
                colorScheme="blue"
                type={hasValidSelectedCoordinates ? "submit" : "button"}
                onClick={() => {
                  if (!hasValidSelectedCoordinates) {
                    setIsLocationDialogOpen(true);
                  }
                }}
                loading={loading}
                disabled={loading}
              >
                {hasValidSelectedCoordinates ? "Submit" : "Next: Choose Place"}
              </Button>
            </HStack>
          </Stack>
        </form>

        <Dialog.Root
          open={isLocationDialogOpen}
          onOpenChange={(details) => setIsLocationDialogOpen(details.open)}
          placement="center"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Set your location to continue</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    Drag the map and keep the place under the center pin.
                  </Text>
                  <LocationPinPicker
                    latitude={manualCoordinates?.latitude ?? null}
                    longitude={manualCoordinates?.longitude ?? null}
                    onSelect={(nextLatitude, nextLongitude) => {
                      setManualCoordinates({ latitude: nextLatitude, longitude: nextLongitude });
                    }}
                  />
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => setIsLocationDialogOpen(false)}
                    disabled={!hasValidSelectedCoordinates}
                  >
                    Use this location
                  </Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger />
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Stack>
    </Container>
  );
}
