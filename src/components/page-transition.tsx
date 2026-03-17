"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [displayChildren, setDisplayChildren] = useState(children);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const timeline = gsap.timeline();

      // Reset overlay position for safety
      gsap.set(overlayRef.current, { yPercent: -100 });

      // 1. Slide down
      timeline.to(overlayRef.current, {
        yPercent: 0,
        duration: 0.6,
        ease: "power4.inOut",
      });

      // 2. Show text with a slight delay
      timeline.to(".transition-text", {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "back.out(1.7)",
      }, "-=0.2");

      // 3. Update children content
      timeline.add(() => {
        setDisplayChildren(children);
      });

      // 4. Hide text
      timeline.to(".transition-text", {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
      }, "+=0.2");

      // 5. Slide up
      timeline.to(overlayRef.current, {
        yPercent: 100,
        duration: 0.6,
        ease: "power4.inOut",
        onComplete: () => {
          // Reset overlay for next transition
          gsap.set(overlayRef.current, { yPercent: -100 });
        }
      });
    }, overlayRef);

    return () => ctx.revert();
  }, [pathname, children]);

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] bg-[#0B1320] flex items-center justify-center pointer-events-auto"
      >
        <div className="flex gap-2 overflow-hidden px-4">
          {"FEAST.ID".split("").map((char, i) => (
            <span
              key={i}
              className="transition-text text-white text-5xl md:text-7xl font-black italic tracking-tighter opacity-0 translate-y-12 inline-block"
            >
              {char}
            </span>
          ))}
        </div>
      </div>
      <div className="transition-wrapper">
        {displayChildren}
      </div>
    </>
  );
}
