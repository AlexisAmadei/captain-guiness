"use client";

import { Badge, Box, Button, Container, Dialog, Field, Heading, HStack, Input, Portal, SimpleGrid, Spinner, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { type SyntheticEvent, useEffect, useState } from "react";
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

type NearbyPlace = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance: number;
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

function InfoCard({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <Box
      rounded="panel"
      borderWidth="1px"
      borderColor="app.border"
      bg="app.surface"
      backdropFilter="blur(18px)"
      shadow="soft"
      p={{ base: 5, md: 6 }}
    >
      <Stack gap={4}>
        <Box>
          <Heading as="h2" size="md" color="app.fg" mb={1}>
            {title}
          </Heading>
          <Text fontSize="sm" color="app.muted">
            {description}
          </Text>
        </Box>
        {children}
      </Stack>
    </Box>
  );
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
  const [pintPrice, setPintPrice] = useState("");
  const [manualCoordinates, setManualCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loadingNearbyPlaces, setLoadingNearbyPlaces] = useState(false);
  const [nearbyPlacesError, setNearbyPlacesError] = useState<string | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedAutoLatitude = typeof latitude === "number" && Number.isFinite(latitude) ? latitude : null;
  const normalizedAutoLongitude = typeof longitude === "number" && Number.isFinite(longitude) ? longitude : null;

  const selectedLatitude = manualCoordinates?.latitude ?? normalizedAutoLatitude ?? null;
  const selectedLongitude = manualCoordinates?.longitude ?? normalizedAutoLongitude ?? null;
  const hasValidSelectedCoordinates =
    selectedLatitude !== null &&
    selectedLongitude !== null &&
    Number.isFinite(selectedLatitude) &&
    Number.isFinite(selectedLongitude);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!isLocationDialogOpen || selectedLatitude === null || selectedLongitude === null) {
        return;
      }

      try {
        setLoadingNearbyPlaces(true);
        setNearbyPlacesError(null);

        const response = await fetch(
          `/api/places/nearby?latitude=${selectedLatitude}&longitude=${selectedLongitude}&radius=800`,
        );

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response, "Failed to load nearby places"));
        }

        const payload = await response.json();
        const allowedTypes = new Set(["bar", "pub", "biergarten", "restaurant", "cafe"]);
        const places = Array.isArray(payload.places) ? payload.places : [];

        setNearbyPlaces(
          places.filter(
            (place: NearbyPlace) =>
              place &&
              typeof place.name === "string" &&
              typeof place.type === "string" &&
              allowedTypes.has(place.type),
          ),
        );
      } catch (placesError) {
        setNearbyPlacesError(
          placesError instanceof Error ? placesError.message : "Failed to load nearby places",
        );
        setNearbyPlaces([]);
      } finally {
        setLoadingNearbyPlaces(false);
      }
    };

    fetchNearbyPlaces();
  }, [isLocationDialogOpen, selectedLatitude, selectedLongitude]);

  const handlePhotoCapture = (file: File) => {
    setPhotoFile(file);
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

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
      setError("Location unavailable. Enable geolocation or select a nearby bar/pub.");
      return;
    }

    if (!Number.isFinite(selectedLatitude) || !Number.isFinite(selectedLongitude)) {
      setError("Invalid location received from device. Please select a nearby bar/pub.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | null = null;

      if (photoFile) {
        const compressedPhoto = await compressImage(photoFile);

        const formData = new FormData();
        formData.append("file", compressedPhoto);
        formData.append("latitude", String(selectedLatitude));
        formData.append("longitude", String(selectedLongitude));

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

        imageUrl = uploadData.url;
      }

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
          comment: null,
          pintPrice: parsedPrice,
          ratedAt: new Date().toISOString(),
          photoUrl: imageUrl,
          latitude: selectedLatitude,
          longitude: selectedLongitude,
          placeId: selectedPlaceId,
        }),
      });

      if (!ratingResponse.ok) {
        throw new Error(await getResponseErrorMessage(ratingResponse, "Failed to submit rating"));
      }

      router.push("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (geoLoading) {
    return (
      <Container maxW="container.md" py={{ base: 6, md: 12 }}>
        <Stack align="center" justify="center" minH="40vh" gap={4}>
          <Spinner size="lg" color="brand.500" />
          <Text color="app.muted">Loading your location...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Box position="relative" overflow="hidden">
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        background="radial-gradient(circle at 12% 12%, rgba(255,255,255,0.72), transparent 30%), radial-gradient(circle at 88% 18%, rgba(224, 143, 30, 0.14), transparent 28%)"
      />
      <Container maxW="container.lg" py={{ base: 6, md: 10 }} position="relative">
        <Stack gap={6}>
          <Box
            rounded="panel"
            borderWidth="1px"
            borderColor="app.border"
            bg="app.surface"
            backdropFilter="blur(18px)"
            shadow="soft"
            p={{ base: 5, md: 6 }}
          >
            <Stack gap={3}>
              <Badge alignSelf="start" colorPalette="brand" rounded="full" px={3} py={1}>
                Quick beer review
              </Badge>
              <Heading as="h1" size="xl" color="app.fg">
                Rate a place
              </Heading>
              <Text color="app.muted" maxW="2xl">
                Capture the essentials fast: a clear location, a precise rating, and optional photo proof.
              </Text>
              <HStack gap={2} flexWrap="wrap">
                <Badge variant="subtle" colorPalette="brand">
                  Half-star precision
                </Badge>
                <Badge variant="subtle" colorPalette="brand">
                  Optional photo
                </Badge>
                <Badge variant="subtle" colorPalette="brand">
                  Nearby place matching
                </Badge>
              </HStack>
            </Stack>
          </Box>

          {geoError && (
            <Box bg="rgba(194, 59, 57, 0.08)" p={4} rounded="cloud" borderWidth="1px" borderColor="app.danger">
              <Text color="app.danger">{geoError}</Text>
            </Box>
          )}

          {error && (
            <Box bg="rgba(194, 59, 57, 0.08)" p={4} rounded="cloud" borderWidth="1px" borderColor="app.danger">
              <Text color="app.danger">{error}</Text>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              <Box
                rounded="panel"
                borderWidth="1px"
                borderColor="app.border"
                bg="app.surface"
                backdropFilter="blur(18px)"
                shadow="soft"
                p={{ base: 5, md: 6 }}
              >
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label>Nom du bar</Field.Label>
                    <Input
                      placeholder="Ex: Le Vieux Port"
                      value={barName}
                      maxLength={120}
                      onChange={(event) => setBarName(event.target.value)}
                      bg="app.surfaceSolid"
                      borderColor="app.border"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Prix de la pinte</Field.Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 7.50"
                      value={pintPrice}
                      onChange={(event) => setPintPrice(event.target.value)}
                      bg="app.surfaceSolid"
                      borderColor="app.border"
                    />
                  </Field.Root>
                </Stack>
              </Box>

              <InfoCard
                title="Rating"
                description="Keep the detailed scores empty if you only want to leave the overall rating."
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                    <Field.Root>
                      <Field.Label>Goût</Field.Label>
                      <StarRating
                        value={criteria.taste}
                        onChange={(value) => setCriteria((prev) => ({ ...prev, taste: value }))}
                      />
                    </Field.Root>
                  </Box>

                  <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                    <Field.Root>
                      <Field.Label>Mousse</Field.Label>
                      <StarRating
                        value={criteria.foam}
                        onChange={(value) => setCriteria((prev) => ({ ...prev, foam: value }))}
                      />
                    </Field.Root>
                  </Box>

                  <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                    <Field.Root>
                      <Field.Label>Crémeuse</Field.Label>
                      <StarRating
                        value={criteria.creamy}
                        onChange={(value) => setCriteria((prev) => ({ ...prev, creamy: value }))}
                      />
                    </Field.Root>
                  </Box>

                  <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                    <Field.Root>
                      <Field.Label>Température</Field.Label>
                      <StarRating
                        value={criteria.temperature}
                        onChange={(value) => setCriteria((prev) => ({ ...prev, temperature: value }))}
                      />
                    </Field.Root>
                  </Box>

                  <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                    <Field.Root>
                      <Field.Label>Présentation</Field.Label>
                      <StarRating
                        value={criteria.presentation}
                        onChange={(value) => setCriteria((prev) => ({ ...prev, presentation: value }))}
                      />
                    </Field.Root>
                  </Box>

                  <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                    <Field.Root>
                      <Field.Label>Rapport qualité/prix</Field.Label>
                      <StarRating
                        value={criteria.valueForMoney}
                        onChange={(value) => setCriteria((prev) => ({ ...prev, valueForMoney: value }))}
                      />
                    </Field.Root>
                  </Box>
                </SimpleGrid>

                <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                  <Field.Root required>
                    <Field.Label>
                      Note générale <Field.RequiredIndicator />
                    </Field.Label>
                    <StarRating
                      value={criteria.overall}
                      onChange={(value) => setCriteria((prev) => ({ ...prev, overall: value }))}
                    />
                  </Field.Root>
                </Box>
              </InfoCard>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <InfoCard title="Photo" description="Add a quick visual if you want to preserve the pour, foam, or glass details.">
                  <PhotoCapture onPhotoCapture={handlePhotoCapture} onClear={handleClearPhoto} />
                </InfoCard>

                <InfoCard title="Location" description="Use device geolocation or choose a nearby bar/pub to anchor the review.">
                  {hasValidSelectedCoordinates ? (
                    <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                      <Text fontSize="sm" color="app.fg">
                        📍 {selectedLatitude.toFixed(6)}, {selectedLongitude.toFixed(6)}
                      </Text>
                      <Text fontSize="xs" color="app.muted" mt={1}>
                        {selectedPlaceId
                          ? "Coordinates set from selected bar/pub"
                          : normalizedAutoLatitude !== null && manualCoordinates === null
                            ? "Coordinates from device geolocation"
                            : "Coordinates set from selected nearby place"}
                      </Text>
                    </Box>
                  ) : (
                    <Box rounded="cloud" borderWidth="1px" borderColor="app.border" bg="app.surfaceSolid" p={4}>
                      <Text fontSize="sm" color="app.muted">
                        No location is locked yet. Open the place picker to continue.
                      </Text>
                    </Box>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setIsLocationDialogOpen(true)}
                    disabled={loading}
                    borderColor="app.border"
                    bg="app.surfaceSolid"
                    justifyContent="space-between"
                  >
                    Choose or refine bar/pub location
                  </Button>
                </InfoCard>
              </SimpleGrid>

              <HStack gap={3} justify="stretch" flexWrap="wrap">
                <Button
                  flex={1}
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  borderColor="app.border"
                  bg="app.surface"
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  colorPalette="brand"
                  type={hasValidSelectedCoordinates ? "submit" : "button"}
                  onClick={() => {
                    if (!hasValidSelectedCoordinates) {
                      setIsLocationDialogOpen(true);
                    }
                  }}
                  loading={loading}
                  disabled={loading}
                >
                  {hasValidSelectedCoordinates ? "Submit review" : "Next: Choose place"}
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
                <Dialog.Content bg="app.surfaceSolid" borderColor="app.border" shadow="lifted" rounded="3xl">
                  <Dialog.Header>
                    <Dialog.Title>Set your location to continue</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Text fontSize="sm" color="app.muted" mb={3}>
                      Use geolocation if available, or pick a nearby bar/pub to set coordinates.
                    </Text>

                    <Stack gap={3}>
                      <Text fontSize="sm" fontWeight="semibold" color="app.fg">
                        Nearby bars/pubs
                      </Text>

                      {selectedLatitude === null || selectedLongitude === null ? (
                        <Text fontSize="sm" color="app.muted">
                          Geolocation is required to list nearby bars/pubs. Enable location access, then reopen this dialog.
                        </Text>
                      ) : null}

                      {loadingNearbyPlaces && (
                        <HStack>
                          <Spinner size="sm" color="brand.500" />
                          <Text fontSize="sm" color="app.muted">
                            Loading nearby bars and pubs...
                          </Text>
                        </HStack>
                      )}

                      {nearbyPlacesError && <Text fontSize="sm" color="app.danger">{nearbyPlacesError}</Text>}

                      {!loadingNearbyPlaces && !nearbyPlacesError && nearbyPlaces.length === 0 && (
                        <Text fontSize="sm" color="app.muted">
                          No nearby bar/pub found around your current location.
                        </Text>
                      )}

                      {!loadingNearbyPlaces && nearbyPlaces.length > 0 && (
                        <Stack gap={2} maxH="48" overflowY="auto" pr={1}>
                          {nearbyPlaces.slice(0, 8).map((place) => {
                            const isSelected = selectedPlaceId === place.id;

                            return (
                              <Button
                                key={place.id}
                                variant={isSelected ? "solid" : "outline"}
                                colorPalette="brand"
                                justifyContent="space-between"
                                borderColor="app.border"
                                bg={isSelected ? undefined : "app.surface"}
                                onClick={() => {
                                  setSelectedPlaceId(place.id);
                                  setManualCoordinates({ latitude: place.lat, longitude: place.lon });
                                  setBarName((prev) => (prev.trim().length > 0 ? prev : place.name));
                                }}
                              >
                                <Text truncate>{place.name}</Text>
                                <Text fontSize="xs" color={isSelected ? "app.accentFg" : "app.muted"}>
                                  {Math.round(place.distance)}m
                                </Text>
                              </Button>
                            );
                          })}
                        </Stack>
                      )}
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)} borderColor="app.border">
                      Cancel
                    </Button>
                    <Button
                      colorPalette="brand"
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
    </Box>
  );
}
