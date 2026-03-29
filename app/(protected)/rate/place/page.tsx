"use client";

import { Box, Button, Container, Field, Heading, HStack, Input, Spinner, Stack, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type Place = {
  id: string;
  name: string;
  type: string;
  distance: number;
  lat: number;
  lon: number;
};

function PlaceSelectorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const latitude = parseFloat(searchParams.get("lat") || "0");
  const longitude = parseFloat(searchParams.get("lon") || "0");
  const hasValidCoords = latitude !== 0 && longitude !== 0;

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/places/nearby?latitude=${latitude}&longitude=${longitude}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch nearby places");
        }

        const data = await response.json();
        setPlaces(data.places || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (hasValidCoords) {
      fetchNearbyPlaces();
    }
  }, [latitude, longitude, hasValidCoords]);

  const handleSubmit = async () => {
    if (!selectedPlace) {
      setError("Please select a place");
      return;
    }

    setSubmitting(true);

    try {
      // Associate the rating with the selected place
      // This would call another API endpoint to update the rating with the place_id
      const response = await fetch("/api/ratings/associate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: selectedPlace }),
      });

      if (!response.ok) {
        throw new Error("Failed to associate place with rating");
      }

      // Redirect to success page or home
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlaces = places.filter(
    (place) =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <Container maxW="container.sm" py={8}>
        <Stack align="center" gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text>Finding nearby places...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="container.sm" py={8}>
      <Stack gap={6}>
        <Heading as="h1" size="lg">
          Choose the place you rated
        </Heading>

        {error && (
          <Box bg="red.50" p={4} borderRadius="md" borderLeft="4px" borderColor="red.500">
            <Text color="red.700">{error}</Text>
          </Box>
        )}

        {places.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No places found nearby. You can still submit without selecting a place.</Text>
          </Box>
        ) : (
          <>
            {/* Search */}
            <Field.Root>
              <Field.Label>Search places</Field.Label>
              <Input
                placeholder="Search by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Field.Root>

            {/* Places List */}
            <Stack gap={3}>
              {filteredPlaces.map((place) => (
                <Box
                  key={place.id}
                  p={4}
                  borderWidth={2}
                  borderColor={selectedPlace === place.id ? "blue.500" : "gray.200"}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => setSelectedPlace(place.id)}
                  bg={selectedPlace === place.id ? "blue.50" : "white"}
                  _hover={{ borderColor: "blue.300" }}
                >
                  <Text fontWeight="bold">{place.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {place.type} · {place.distance.toFixed(2)}m away
                  </Text>
                </Box>
              ))}
            </Stack>
          </>
        )}

        {/* Action Buttons */}
        <HStack gap={3} pt={4}>
          <Button
            flex={1}
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Back
          </Button>
          <Button
            flex={1}
            colorScheme="blue"
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting || (!selectedPlace && places.length > 0)}
          >
            Confirm Place
          </Button>
        </HStack>
      </Stack>
    </Container>
  );
}

export default function PlaceSelectorPage() {
  return (
    <Suspense
      fallback={
        <Container maxW="container.sm" py={8}>
          <Stack align="center" gap={4}>
            <Spinner size="lg" color="blue.500" />
            <Text>Loading...</Text>
          </Stack>
        </Container>
      }
    >
      <PlaceSelectorContent />
    </Suspense>
  );
}
