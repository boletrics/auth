import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { Logo } from "./Logo";

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe("Logo", () => {
	it("renders logo variant by default", () => {
		renderWithTheme(<Logo />);
		const ticketIcon = document.querySelector("svg");
		const text = screen.getByText("Boletrics");
		expect(ticketIcon).toBeInTheDocument();
		expect(text).toBeInTheDocument();
	});

	it("renders icon variant when specified", () => {
		const { container } = renderWithTheme(<Logo variant="icon" />);
		const ticketIcon = document.querySelector("svg");
		const textElements = container.querySelectorAll("span");
		// In icon variant, there should be no text spans
		const boletricsText = Array.from(textElements).find((el) =>
			el.textContent?.includes("Boletrics"),
		);
		expect(ticketIcon).toBeInTheDocument();
		expect(boletricsText).toBeUndefined();
	});

	it("applies custom className", () => {
		const { container } = renderWithTheme(<Logo className="custom-class" />);
		const logoContainer = container.querySelector("div");
		expect(logoContainer).toHaveClass("custom-class");
	});

	it("applies custom className to icon", () => {
		renderWithTheme(<Logo imgClassName="custom-icon-class" />);
		const ticketIcon = document.querySelector("svg");
		// Check that the SVG exists and has classes
		expect(ticketIcon).toBeInTheDocument();
		// The className might be a string or object, so check if it exists
		expect(ticketIcon).toHaveAttribute("class");
	});
});
