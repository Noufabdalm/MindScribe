"use client";

import { useState, useEffect } from "react";

interface HeaderProps {
  name: string;
}

export function Header({ name }: HeaderProps) {
  const affirmations = [
    "Keep going,",
    "Believe in yourself,",
    "You are enough,",
    "Trust the process,",
    "Stay positive,",
    "Embrace today,",
    "You got this,",
    "One step at a time,"
  ];

  const [affirmation, setAffirmation] = useState("");

  function getRandomAffirmation() {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  }

  function setNewAffirmation() {
    setAffirmation(getRandomAffirmation());
  }

  useEffect(setNewAffirmation, []);

  return (
    <h1 className="text-2xl font-bold text-gray-800">
      {affirmation} <span className="text-blue-600">{name}</span>!
    </h1>
  );
}
