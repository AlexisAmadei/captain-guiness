"use client";

import dynamic from "next/dynamic";
import { Box, Container, Heading, HStack, Image, Spinner, Stack, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

type Review = {
  id: string;
  rating: number;
  barName: string | null;
  comment: string | null;
  photoUrl: string;
  placeId: string | null;
  createdAt: string | null;
};

const CommunityMap = dynamic(
  () => import("@/components/CommunityMap").then((mod) => mod.CommunityMap),
  {
    ssr: false,
    loading: () => (
      <Stack h="full" align="center" justify="center" gap={3}>
        <Spinner size="lg" color="blue.500" />
        <Text fontSize="sm" color="gray.600">
          Loading map...
        </Text>
      </Stack>
    ),
  },
);

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRecentReviews = async () => {
      try {
        setLoadingReviews(true);
        setReviewsError(null);

        const response = await fetch("/api/ratings?limit=20");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load reviews");
        }

        if (!cancelled) {
          setReviews(payload.reviews ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setReviewsError(error instanceof Error ? error.message : "Failed to load reviews");
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingReviews(false);
        }
      }
    };

    loadRecentReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasReviews = useMemo(() => reviews.length > 0, [reviews.length]);

  return (
    <Container maxW="container.md" py={4}>
      <Stack gap={6}>
        <Box h="72" borderWidth={1} borderColor="gray.200" borderRadius="lg" overflow="hidden">
          <CommunityMap />
        </Box>

        <Stack gap={3}>
          <Heading as="h1" size="md">
            Recent reviews
          </Heading>

          {loadingReviews && (
            <HStack justify="center" py={8}>
              <Spinner size="md" color="blue.500" />
            </HStack>
          )}

          {!loadingReviews && reviewsError && (
            <Box p={4} borderRadius="md" bg="red.50" borderLeft="4px" borderColor="red.500">
              <Text color="red.700">{reviewsError}</Text>
            </Box>
          )}

          {!loadingReviews && !reviewsError && !hasReviews && (
            <Box p={4} borderRadius="md" borderWidth={1} borderColor="gray.200">
              <Text color="gray.600">No reviews yet.</Text>
            </Box>
          )}

          {!loadingReviews && !reviewsError && hasReviews && (
            <Stack gap={3}>
              {reviews.map((review) => (
                <Box key={review.id} borderWidth={1} borderColor="gray.200" borderRadius="md" p={3}>
                  <HStack align="start" gap={3}>
                    <Image
                      src={review.photoUrl}
                      alt="Review photo"
                      boxSize="16"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <Stack gap={1} flex={1}>
                      <HStack justify="space-between" align="start">
                        <Text fontWeight="semibold">{review.barName || (review.placeId ? `Place ${review.placeId}` : "Unnamed place")}</Text>
                        <Text color="gray.600">{review.rating.toFixed(1)} / 5</Text>
                      </HStack>
                      <Text color="gray.600" fontSize="sm">{formatDate(review.createdAt)}</Text>
                      {review.comment ? (
                        <Text fontSize="sm">{review.comment}</Text>
                      ) : (
                        <Text fontSize="sm" color="gray.500">No comment</Text>
                      )}
                    </Stack>
                  </HStack>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
