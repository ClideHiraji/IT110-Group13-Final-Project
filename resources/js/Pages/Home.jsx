import React from "react";
import AppLayout from "../Layouts/AppLayout";
import Header from "../Components/Header";
import Hero from "../Components/Hero";
import Timeline from "./Timeline";

/**
 * Home page
 *
 * Top-level landing page that composes:
 * - AppLayout: global shell (background, meta, etc.).
 * - Header: navigation and authenticated user info.
 * - Hero: main intro section with a call-to-action button.
 * - Timeline: the interactive classical art timeline.
 *
 * Behavior:
 * - Provides a scrollToTimeline function passed to Hero as onBegin.
 * - scrollToTimeline finds the element with id="timeline-start" and smoothly
 *   scrolls the viewport to it using Element.scrollIntoView({ behavior: 'smooth' }).
 *
 * Props:
 * - auth {object}: Authentication data passed down to Header (e.g., auth.user).
 */
export default function Home({ auth }) {
  /**
   * Scroll handler used by the Hero "Begin" button.
   * - Locates the DOM element with id="timeline-start".
   * - If found, scrolls smoothly to the top of that section.
   */
  const scrollToTimeline = () => {
    const el = document.getElementById("timeline-start");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AppLayout>
      {/* Global site header with auth-aware navigation */}
      <Header auth={auth} />
      {/* Hero section; clicking its CTA triggers smooth scroll to the timeline */}
      <Hero onBegin={scrollToTimeline} />
      {/* Main classical art timeline section (anchor target for scrolling) */}
      <Timeline />
    </AppLayout>
  );
}
