"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FOCUS_MAP_POINT_EVENT, type FocusMapPointDetail } from "@/lib/map/events";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LuArrowUpRight, LuChevronDown, LuPlus, LuSparkles, LuStar } from "react-icons/lu";

type ReviewPoint = {
  id: string;
  placeId: string | null;
  name: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  ratingCount: number;
  lastRatedAt: string | null;
};

type ReviewsMapResponse = {
  points?: ReviewPoint[];
  error?: string;
};

function formatAverageRating(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCount(count: number) {
  return count === 1 ? "1 note" : `${count} notes`;
}

function formatLastRatedAt(value: string | null) {
  if (!value) return "Dernière note inconnue";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Dernière note inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(parsed);
}

export function ReviewPill() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/ratings/map?scope=all", {
          signal: controller.signal,
        });
        const payload: ReviewsMapResponse = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Impossible de charger les avis");
        }

        const nextReviews = (payload.points ?? []).slice().sort((left, right) => {
          if (right.averageRating !== left.averageRating) {
            return right.averageRating - left.averageRating;
          }

          if (right.ratingCount !== left.ratingCount) {
            return right.ratingCount - left.ratingCount;
          }

          return left.name.localeCompare(right.name);
        });

        setReviews(nextReviews);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Erreur inconnue");
        setReviews([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => controller.abort();
  }, []);

  const totalRatings = useMemo(
    () => reviews.reduce((sum, review) => sum + review.ratingCount, 0),
    [reviews],
  );

  const focusPointOnMap = (review: ReviewPoint) => {
    const detail: FocusMapPointDetail = {
      id: review.id,
      name: review.name,
      latitude: review.latitude,
      longitude: review.longitude,
      averageRating: review.averageRating,
      ratingCount: review.ratingCount,
    };

    window.dispatchEvent(new CustomEvent(FOCUS_MAP_POINT_EVENT, { detail }));
  };

  const topReview = reviews[0];

  if (!isOpen) {
    return (
      <>
        <Button
          position="fixed"
          left={{ base: 3, md: 5 }}
          bottom={{ base: 16, md: 17 }}
          zIndex={30}
          borderRadius="full"
          boxSize="12"
          p="0"
          colorPalette="blue"
          boxShadow="0 18px 40px rgba(15, 23, 42, 0.18)"
          aria-label="Ajouter un avis"
          onClick={() => router.push("/rate")}
        >
          <LuPlus size={18} />
        </Button>

        <Button
          position="fixed"
          left={{ base: 3, md: 5 }}
          bottom={{ base: 4, md: 5 }}
          zIndex={30}
          borderRadius="full"
          px="4"
          py="3"
          h="auto"
          colorPalette="blue"
          boxShadow="0 18px 40px rgba(15, 23, 42, 0.18)"
          onClick={() => setIsOpen(true)}
        >
          <LuSparkles size={16} />
          <Text fontWeight="semibold">Avis</Text>
          <Badge variant="solid" colorPalette="blue" borderRadius="full" px="2">
            {reviews.length || "-"}
          </Badge>
        </Button>
      </>
    );
  }

  return (
    <Card.Root
      position="fixed"
      left={{ base: 3, md: 5 }}
      bottom={{ base: 4, md: 5 }}
      zIndex={30}
      w={{ base: "calc(100vw - 1.5rem)", sm: "20rem", md: "22rem" }}
      maxH="min(58vh, 32rem)"
      variant="elevated"
      bg="bg"
      borderWidth="1px"
      borderColor="border"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 20px 60px rgba(15, 23, 42, 0.22)"
      backdropFilter="blur(18px)"
      transform={entered ? "translateY(0)" : "translateY(36px)"}
      opacity={entered ? 1 : 0}
      transition="transform 480ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms ease"
      willChange="transform, opacity"
      pointerEvents="auto"
      role="region"
      aria-label="Reviews classées par note moyenne"
    >
      <Box h="1.5" bgGradient="linear(to-r, blue.400, cyan.300, emerald.300)" />
      <Card.Body gap="4" p="4" display="flex" flexDirection="column" minH={0}>
        <Stack gap="1">
          <HStack justify="space-between" align="start" gap="3">
            <HStack gap="2.5" minW={0}>
              <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxSize="9"
                borderRadius="full"
                bg="blue.50"
                color="blue.600"
              >
                <LuStar size={15} />
              </Box>
              <Stack gap="0" minW={0}>
                <Text fontWeight="semibold" lineHeight="1.1">
                  Avis les mieux notés
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {reviews.length} lieux • {totalRatings} notes
                </Text>
              </Stack>
            </HStack>

            <HStack gap="2">
              {topReview && (
                <Badge colorPalette="blue" variant="subtle" borderRadius="full" px="2">
                  {formatAverageRating(topReview.averageRating)} / 5
                </Badge>
              )}
              <Button
                size="xs"
                variant="ghost"
                colorPalette="gray"
                onClick={() => setIsOpen(false)}
                aria-label="Masquer les avis"
              >
                <LuChevronDown size={14} />
              </Button>
            </HStack>
          </HStack>

          <Text fontSize="sm" color="fg.muted">
            Liste triée par moyenne décroissante.
          </Text>
        </Stack>

        {loading ? (
          <Stack gap="3">
            <Skeleton h="12" borderRadius="xl" />
            <Skeleton h="12" borderRadius="xl" />
            <Skeleton h="12" borderRadius="xl" />
          </Stack>
        ) : error ? (
          <Box borderRadius="xl" bg="red.50" px="3" py="2.5">
            <Text fontSize="sm" color="red.700">
              {error}
            </Text>
          </Box>
        ) : (
          <Stack gap="2" flex="1" minH={0} overflowY="auto" pr="1">
            {reviews.map((review, index) => (
              <HStack
                key={review.id}
                as="button"
                align="center"
                justify="space-between"
                gap="3"
                px="3"
                py="2.5"
                borderRadius="xl"
                bg={index === 0 ? "blue.50" : "bg.subtle"}
                cursor="pointer"
                textAlign="left"
                transition="background-color 120ms ease"
                _hover={{ bg: index === 0 ? "blue.100" : "bg.muted" }}
                _focusVisible={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                onClick={() => focusPointOnMap(review)}
                aria-label={`Centrer la carte sur ${review.name}`}
              >
                <HStack gap="3" minW={0} flex="1">
                  <Box
                    flexShrink={0}
                    boxSize="8"
                    borderRadius="full"
                    bg={index === 0 ? "blue.600" : "gray.200"}
                    color={index === 0 ? "white" : "fg"}
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                    fontWeight="semibold"
                  >
                    {index + 1}
                  </Box>

                  <Stack gap="0" minW={0} flex="1">
                    <Text fontWeight="medium" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                      {review.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {formatCount(review.ratingCount)} • {formatLastRatedAt(review.lastRatedAt)}
                    </Text>
                  </Stack>
                </HStack>

                <Stack gap="0" align="end" flexShrink={0}>
                  <Text fontSize="sm" fontWeight="semibold" lineHeight="1">
                    {formatAverageRating(review.averageRating)}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    moyenne
                  </Text>
                </Stack>
              </HStack>
            ))}

            {reviews.length === 0 && (
              <Box borderRadius="xl" bg="bg.subtle" px="3" py="4" textAlign="center">
                <Text fontSize="sm" color="fg.muted">
                  Aucun avis disponible pour le moment.
                </Text>
              </Box>
            )}
          </Stack>
        )}

        <HStack justify="space-between" pt="1" fontSize="xs" color="fg.muted">
          <Text>Tri dynamique par note moyenne</Text>
          <HStack gap="1">
            <LuArrowUpRight size={12} />
            <Text>Live</Text>
          </HStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}