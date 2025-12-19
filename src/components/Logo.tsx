"use client";

import { Ticket } from "lucide-react";
import { useTheme } from "next-themes";

function Logo({
	variant = "logo",
	className,
	imgClassName,
	width,
	height,
	forceTheme,
}: {
	variant?: "logo" | "icon";
	className?: string;
	imgClassName?: string;
	width?: number;
	height?: number;
	forceTheme?: "light" | "dark";
}) {
	const { resolvedTheme } = useTheme();
	const theme = forceTheme || resolvedTheme || "light";

	// Use theme-aware colors that are visible in both light and dark modes
	// text-foreground and text-primary adapt automatically to the theme
	const textColor = "text-foreground";
	const iconColor = "text-primary";

	return (
		<div className={`flex items-center gap-2 ${className || ""}`}>
			<Ticket
				className={`${iconColor} ${imgClassName || ""}`.trim()}
				size={variant === "icon" ? width || 24 : height || 24}
			/>
			{variant === "logo" ? (
				<span className={`font-semibold text-lg ${textColor}`}>Boletrics</span>
			) : null}
		</div>
	);
}

export { Logo };
