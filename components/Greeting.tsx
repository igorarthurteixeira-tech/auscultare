"use client";

import { useMemo } from "react";

const greetings = {
  dawn:      { main: "Bom dia.", sub: "Como chegou ao amanhecer hoje?" },
  morning:   { main: "Bom dia.", sub: "Como está seu coração esta manhã?" },
  afternoon: { main: "Boa tarde.", sub: "Como foi o seu dia até aqui?" },
  evening:   { main: "Boa noite.", sub: "Como você está chegando ao fim deste dia?" },
  night:     { main: "Boa noite.", sub: "Ainda acordado. O que pesa em você agora?" },
};

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return greetings.dawn;
  if (hour >= 7 && hour < 12) return greetings.morning;
  if (hour >= 12 && hour < 18) return greetings.afternoon;
  if (hour >= 18 && hour < 22) return greetings.evening;
  return greetings.night;
}

interface GreetingProps {
  name?: string;
}

export default function Greeting({ name }: GreetingProps) {
  const greeting = useMemo(() => getTimeGreeting(), []);
  const main = name ? `${greeting.main.replace(".", ",")} ${name}.` : greeting.main;

  return (
    <div className="text-center space-y-3">
      <h1
        className="text-5xl md:text-7xl font-serif font-light tracking-tight"
        style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}
      >
        {main}
      </h1>
      <p
        className="text-lg md:text-xl font-light"
        style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}
      >
        {greeting.sub}
      </p>
    </div>
  );
}
