"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type Token = {
  className: string;
  text: string;
};

const TYPING_LINES: Token[][] = [
  [
    {
      className: "text-white/70",
      text: "    grid = player_state.",
    },
    {
      className: "text-[#60a5fa]",
      text: "get_matrix",
    },
    {
      className: "text-white/70",
      text: "()",
    },
  ],
  [
    {
      className: "text-white/70",
      text: "    frontier = ",
    },
    {
      className: "text-[#93c5fd]",
      text: "deque",
    },
    {
      className: "text-white/70",
      text: "([player_state.origin])",
    },
  ],
  [
    {
      className: "text-white/70",
      text: "    best_move = ",
    },
    {
      className: "text-[#60a5fa]",
      text: "search",
    },
    {
      className: "text-white/70",
      text: "(frontier, grid)",
    },
  ],
];

const LINE_LENGTHS = TYPING_LINES.map((line) =>
  line.reduce((count, token) => count + token.text.length, 0),
);

const TOTAL_CHARACTERS = LINE_LENGTHS.reduce((count, value) => count + value, 0);
const START_DELAY_MS = 540;
const TYPING_SPEED_MS = 28;

export function HeroTypingSnippet() {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frameId = window.requestAnimationFrame(() => {
        setVisibleCharacters(TOTAL_CHARACTERS);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    let intervalId = 0;
    let frameId = 0;
    const timeoutId = window.setTimeout(() => {
      frameId = window.requestAnimationFrame(() => {
        intervalId = window.setInterval(() => {
          setVisibleCharacters((currentValue) => {
            if (currentValue >= TOTAL_CHARACTERS) {
              window.clearInterval(intervalId);
              return currentValue;
            }

            return currentValue + 1;
          });
        }, TYPING_SPEED_MS);
      });
    }, START_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  const activeLineIndex = getActiveLineIndex(visibleCharacters);

  return (
    <>
      {TYPING_LINES.map((line, lineIndex) => {
        if (visibleCharacters < TOTAL_CHARACTERS && lineIndex > activeLineIndex) {
          return null;
        }

        const visibleInLine = getVisibleCharactersForLine(visibleCharacters, lineIndex);
        const renderedTokens: ReactNode[] = [];
        let remainingCharacters = visibleInLine;

        for (const token of line) {
          if (remainingCharacters <= 0) {
            break;
          }

          const visibleText = token.text.slice(0, remainingCharacters);
          remainingCharacters -= visibleText.length;

          renderedTokens.push(
            <span
              key={`${lineIndex}-${token.className}-${token.text}`}
              className={token.className}
            >
              {visibleText}
            </span>,
          );
        }

        return (
          <span key={lineIndex} className="block min-h-[1.65em]">
            {renderedTokens}
            {activeLineIndex === lineIndex && visibleCharacters > 0 ? (
              <span className="terminal-cursor-blink text-white">_</span>
            ) : null}
          </span>
        );
      })}
    </>
  );
}

function getVisibleCharactersForLine(visibleCharacters: number, lineIndex: number) {
  const consumedBefore = LINE_LENGTHS.slice(0, lineIndex).reduce(
    (count, value) => count + value,
    0,
  );

  return Math.max(
    0,
    Math.min(LINE_LENGTHS[lineIndex], visibleCharacters - consumedBefore),
  );
}

function getActiveLineIndex(visibleCharacters: number) {
  if (visibleCharacters >= TOTAL_CHARACTERS) {
    return TYPING_LINES.length - 1;
  }

  let consumed = 0;
  for (let index = 0; index < LINE_LENGTHS.length; index += 1) {
    consumed += LINE_LENGTHS[index];
    if (visibleCharacters <= consumed) {
      return index;
    }
  }

  return 0;
}
