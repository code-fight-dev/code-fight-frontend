import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/docs/page", () => {
  it("exposes metadata and renders docs view with page data", async () => {
    const docsData = {
      sections: [],
      quickstart: {
        title: "Quickstart",
      },
    };

    const getDocsPageDataMock = vi.fn().mockResolvedValue(docsData);
    const DocsPageViewMock = vi.fn(({ data }: { data: unknown }) => (
      <div data-testid="docs-page-view">{JSON.stringify(data)}</div>
    ));

    const pageModule = await loadPageModule(
      () => import("@/app/docs/page"),
      () => {
        vi.doMock("@/views/docs/server", () => ({
          getDocsPageData: getDocsPageDataMock,
        }));
        vi.doMock("@/views/docs", () => ({
          DocsPageView: DocsPageViewMock,
        }));
      },
    );
    const { default: DocumentationPage, metadata } = pageModule;
    const element = await DocumentationPage();

    render(element);

    expect(metadata).toEqual({
      title: "Documentation | CodeFight",
      description: "Guides, API reference, and platform workflows for CodeFight.",
    });
    expect(getDocsPageDataMock).toHaveBeenCalledTimes(1);
    expect(getFirstCallProps(DocsPageViewMock)).toEqual({
      data: docsData,
    });
    expect(screen.getByTestId("docs-page-view")).toHaveTextContent(
      '"title":"Quickstart"',
    );
  });
});
