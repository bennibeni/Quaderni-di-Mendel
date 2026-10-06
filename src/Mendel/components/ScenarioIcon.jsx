import React from "react";

const ICONS = {
  piselli: "🫛",
  polli: "🐔",
  sangue: "🩸",
  gatti: "🐱",
  labrador: "🦮",
  conigli: "🐇",
  cavalli: "🐴",
  odoroso: "🌸",
  topi: "🐭",
  drosofila: "🪰",
};

export default function ScenarioIcon({ scenario }) {
  return (
    <span className="scenario-icon" aria-hidden="true">
      {ICONS[scenario]}
    </span>
  );
}
