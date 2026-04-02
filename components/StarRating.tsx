"use client";

import { HStack, Icon } from "@chakra-ui/react";
import { useCallback } from "react";
import { Star } from "lucide-react";

type StarRatingProps = {
  value: number;
  onChange: (rating: number) => void;
  maxStars?: number;
  size?: number;
};

export function StarRating({
  value,
  onChange,
  maxStars = 5,
  size = 5,
}: StarRatingProps) {
  const handleClick = useCallback(
    (index: number) => {
      onChange(index + 1);
    },
    [onChange],
  );

  const handleTouchMove = useCallback(
    (_index: number, event: React.TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const handleTouchEnd = useCallback(
    (index: number) => {
      onChange(index + 1);
    },
    [onChange],
  );

  const displayRating = value;

  const stars = Array.from({ length: maxStars }, (_, i) => {
    const starIndex = i + 1;
    const isFilled = starIndex <= Math.floor(displayRating);

    return (
      <div
        key={i}
        onClick={() => handleClick(i)}
        onTouchMove={(e) => handleTouchMove(i, e)}
        onTouchEnd={() => handleTouchEnd(i)}
        style={{ cursor: "pointer", position: "relative" }}
      >
        <Icon
          as={Star}
          boxSize={size}
          color={isFilled ? "brand.500" : "app.border"}
          fill={isFilled ? "currentColor" : "transparent"}
          transition="transform 0.15s ease, color 0.15s ease"
          _hover={{ transform: "translateY(-1px) scale(1.03)" }}
        />
      </div>
    );
  });

  return <HStack gap="1">{stars}</HStack>;
}
