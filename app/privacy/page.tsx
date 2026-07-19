import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Your privacy, in plain words"
      title="Privacy Policy"
      intro="We designed the game so your names, scores, and word history stay on your own device."
      sections={[
        { title: "What we store", content: <p>The game stores player names, selected mode, scores, played words, and theme preference in your browser&apos;s local storage. This lets you continue after refreshing or closing the page.</p> },
        { title: "What we do not collect", content: <p>We do not create user accounts, run advertising trackers, or save your game history in our database. We do not sell or share player names or scores.</p> },
        { title: "Word checks", content: <p>When you submit a word, the word is sent through our app to Free Dictionary API for validation. In machine mode, the required starting letter and recent used-word list are used to request suggestions from Datamuse. Do not enter personal information as a game word.</p> },
        { title: "Removing your data", content: <p>Select Reset inside the game to remove the saved game from local storage. You can also clear this site&apos;s browser data at any time. Play again clears scores and word history while keeping the player names.</p> },
        { title: "Third-party services", content: <p>Free Dictionary API and Datamuse process word requests under their own privacy practices. Their availability and policies are outside our control.</p> },
        { title: "Questions", content: <p>For privacy questions, contact the maintainer through sartajalam.in. A parent or guardian may contact us about a child&apos;s use of the game.</p> },
      ]}
    />
  );
}
