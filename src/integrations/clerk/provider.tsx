import { ClerkProvider } from "@clerk/clerk-react";
import { jaJP } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import { useThemeContext } from "../../contexts/ThemeContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
	throw new Error("Add your Clerk Publishable Key to the .env.local file");
}

export default function AppClerkProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { resolvedTheme } = useThemeContext();

	return (
		<ClerkProvider
			publishableKey={PUBLISHABLE_KEY}
			afterSignOutUrl="/"
			signInFallbackRedirectUrl="/"
			signUpFallbackRedirectUrl="/"
			localization={jaJP}
			appearance={{
				baseTheme: resolvedTheme === "dark" ? dark : undefined,
			}}
		>
			{children}
		</ClerkProvider>
	);
}
