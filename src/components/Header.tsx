import { useAuth } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";

import ClerkHeader from "../integrations/clerk/header-user.tsx";

export default function Header() {
	const { isLoaded } = useAuth();

	const homeLink = isLoaded ? "/" : "/";

	return (
		<>
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:block p-2 bg-background text-foreground"
			>
				Skip to content
			</a>

			<header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
				<div className="px-3 sm:px-4">
					<div className="flex items-center justify-between h-12">
						<div className="flex items-center gap-1 min-w-0">
							<Link
								to={homeLink}
								className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors shrink-0"
								aria-label="ホームへ"
							>
								<img src="/logo.svg" className="h-6 w-6" alt="App" />
							</Link>
						</div>

						<div className="flex items-center gap-1 shrink-0">
							<ClerkHeader />
						</div>
					</div>
				</div>
			</header>
		</>
	);
}
