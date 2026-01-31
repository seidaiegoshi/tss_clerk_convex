import { useAuth } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { isSignedIn, isLoaded } = useAuth();

	return (
		<div className="flex flex-col items-center justify-center h-full p-6">
			<h1 className="text-4xl font-bold mb-4">My App</h1>
			<p className="text-muted-foreground mb-8 text-center max-w-md">
				TanStack Start + Clerk + Convex + shadcn/ui テンプレート
			</p>

			{isLoaded && isSignedIn ? (
				<p className="text-lg text-foreground">
					ログイン済みです。ここからアプリを構築してください。
				</p>
			) : (
				<p className="text-muted-foreground">右上からログインしてください。</p>
			)}
		</div>
	);
}
