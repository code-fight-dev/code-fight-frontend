import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/contact/page", () => {
  it("renders contact page view", async () => {
    const ContactPageViewMock = vi.fn(() => (
      <div data-testid="contact-page-view">contact-content</div>
    ));

    const { default: ContactPage, metadata } = await loadPageModule(
      () => import("@/app/contact/page"),
      () => {
        vi.doMock("@/views/company", () => ({
          ContactPageView: ContactPageViewMock,
        }));
      },
    );

    const element = ContactPage();
    render(element);

    expect(ContactPageViewMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("contact-page-view")).toHaveTextContent("contact-content");
    expect(metadata).toMatchObject({
      title: "Contact | CodeFight",
    });
  });
});
