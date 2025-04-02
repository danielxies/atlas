/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */


import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [truncatedWords, setTruncatedWords] = useState(words.slice(0, 70));

  const wordsArray = truncatedWords.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    const maxWords = 70;

    if (words.length > maxWords) {
      const truncated = words.slice(0, maxWords);
      truncated.push({ text: "...", className: "" });
      setTruncatedWords(truncated);
    } else {
      setTruncatedWords(words);
    }
  }, [words]);

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
        },
        {
          duration: 0.075,
          delay: stagger(0.006),
          ease: "easeInOut",
        }
      );
    }
  }, [isInView]);

  const renderWords = () => (
    <motion.div ref={scope} className="inline">
      {wordsArray.map((word, idx) => (
        <div key={`word-${idx}`} className="inline-block">
          {word.text.map((char, index) => (
            <motion.span
              initial={{}}
              key={`char-${index}`}
              className={cn(
                `text-white opacity-0 hidden`,
                word.className
              )}
              style={{ 
                lineHeight: '1', // Tighter line height
                display: 'inline-block',
                marginBottom: '-0.25em', // Negative margin to further reduce space between lines
              }}
            >
              {char}
            </motion.span>
          ))}
          &nbsp;
        </div>
      ))}
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "text-xs sm:text-sm md:text-base lg:text-lg text-left",
        className
      )}
      style={{ 
        position: "relative", 
        display: "inline-block",
        lineHeight: '1.2', // Tighter overall line height for the container
      }}
    >
      {renderWords()}
    </div>
  );
};
