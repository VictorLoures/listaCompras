import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// O jsdom não implementa rolagem; o app chama scrollTo ao trocar de modo.
window.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
});
