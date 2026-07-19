import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="The fair-play stuff"
      title="Terms of Use"
      intro="These simple terms help keep Word Chai Challenge safe, fair, and fun for everyone."
      sections={[
        { title: "Using the game", content: <p>Word Chai Challenge is a free educational word game. You may use it for personal, family, or classroom play. Please do not misuse the service, attempt to disrupt it, or use automated tools to overload its word APIs.</p> },
        { title: "Children and supervision", content: <p>The game is designed to be child-friendly, but a parent, guardian, or teacher should supervise younger children while they use the internet. Players should use first names or nicknames rather than sensitive personal information.</p> },
        { title: "Words and scores", content: <p>Dictionary results and WordBot suggestions come from third-party language services. Languages change, so a real word may occasionally be missing or an unusual word may appear. Scores are for fun and are not an official assessment.</p> },
        { title: "Availability", content: <p>We aim to keep the game working, but we cannot guarantee uninterrupted access. Dictionary or word-search providers may be slow, unavailable, or change their services.</p> },
        { title: "Acceptable play", content: <p>Do not enter abusive, hateful, sexual, or otherwise inappropriate words, especially while playing with children. Adults supervising a game are responsible for appropriate play.</p> },
        { title: "Changes", content: <p>We may update the game or these terms to improve safety and functionality. Continued use after an update means you accept the revised terms.</p> },
      ]}
    />
  );
}
