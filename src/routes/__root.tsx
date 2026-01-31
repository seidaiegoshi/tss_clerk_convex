import { TanStackDevtools } from "@tanstack/react-devtools";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AlertCircle, Home, RefreshCw, ServerCrash } from "lucide-react";

import { ErrorBoundary } from "../components/ErrorBoundary";
import Header from "../components/Header";
import { UserInitializer } from "../components/UserInitializer";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";
import { ThemeProvider } from "../contexts/ThemeContext";
import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";

import appCss from "../styles.css?url";

function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center h-full p-6">
			<AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
			<h1 className="text-3xl font-bold mb-2">ページが見つかりません</h1>
			<p className="text-muted-foreground mb-6 text-center max-w-md">
				お探しのページは存在しないか、移動された可能性があります
			</p>
			<Button asChild>
				<Link to="/">
					<Home className="h-4 w-4 mr-2" />
					ホームに戻る
				</Link>
			</Button>
		</div>
	);
}

function GlobalError({ error, reset }: ErrorComponentProps) {
	const isDev = import.meta.env.DEV;

	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
			<ServerCrash className="h-16 w-16 text-destructive mb-4" />
			<h1 className="text-3xl font-bold mb-2">エラーが発生しました</h1>
			<p className="text-muted-foreground mb-6 text-center max-w-md">
				申し訳ありません。予期せぬエラーが発生しました。
				<br />
				しばらく時間をおいてから再度お試しください。
			</p>

			<div className="flex gap-3">
				<Button onClick={reset} variant="outline">
					<RefreshCw className="h-4 w-4 mr-2" />
					再試行
				</Button>
				<Button asChild>
					<Link to="/">
						<Home className="h-4 w-4 mr-2" />
						ホームに戻る
					</Link>
				</Button>
			</div>

			{isDev && error instanceof Error && (
				<details className="mt-8 w-full max-w-2xl">
					<summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
						開発者向け詳細（本番環境では表示されません）
					</summary>
					<div className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
						<p className="font-mono text-sm text-destructive mb-2">
							{error.message}
						</p>
						<pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
							{error.stack}
						</pre>
					</div>
				</details>
			)}
		</div>
	);
}

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content:
					"width=device-width, initial-scale=1, interactive-widget=resizes-content",
			},
			{ title: "My App" },
			{
				name: "description",
				content: "My App description",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
		],
		scripts: [
			{
				children: `
				(function() {
					try {
						var t = localStorage.getItem('app-theme') || 'light';
						if (t !== 'light' && t !== 'dark' && t !== 'system') t = 'light';
						var r = (t === 'system')
							? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
							: t;
						var el = document.documentElement;
						if (r === 'dark') el.classList.add('dark');
						el.dataset.theme = t;
						el.dataset.resolvedTheme = r;
					} catch(e) {}
				})();
			`,
			},
		],
	}),

	component: AppLayout,
	notFoundComponent: NotFound,
	errorComponent: GlobalError,
	shellComponent: RootDocument,
});

function AppLayout() {
	return (
		<div className="h-dvh flex flex-col overflow-hidden">
			<Header />
			<main className="flex-1 overflow-y-auto">
				<UserInitializer>
					<Outlet />
				</UserInitializer>
			</main>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-background" suppressHydrationWarning>
				<ThemeProvider>
					<ClerkProvider>
						<ConvexProvider>
							<ErrorBoundary>
								{children}
								<Toaster position="top-center" />
							</ErrorBoundary>
							<TanStackDevtools
								config={{
									position: "bottom-right",
								}}
								plugins={[
									{
										name: "Tanstack Router",
										render: <TanStackRouterDevtoolsPanel />,
									},
								]}
							/>
						</ConvexProvider>
					</ClerkProvider>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
