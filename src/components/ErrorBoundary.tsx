import { Link } from "@tanstack/react-router";
import { Home, RefreshCw, ServerCrash } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Button } from "./ui/button";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// 本番環境ではエラーを外部サービスに送信することも可能
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

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
						<Button onClick={this.handleReset} variant="outline">
							<RefreshCw className="h-4 w-4 mr-2" />
							再試行
						</Button>
						<Link to="/">
							<Button>
								<Home className="h-4 w-4 mr-2" />
								ホームに戻る
							</Button>
						</Link>
					</div>

					{isDev && this.state.error && (
						<details className="mt-8 w-full max-w-2xl">
							<summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
								開発者向け詳細（本番環境では表示されません）
							</summary>
							<div className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
								<p className="font-mono text-sm text-destructive mb-2">
									{this.state.error.message}
								</p>
								<pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
									{this.state.error.stack}
								</pre>
							</div>
						</details>
					)}
				</div>
			);
		}

		return this.props.children;
	}
}
