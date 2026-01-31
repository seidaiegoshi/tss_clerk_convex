import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";

/**
 * ユーザー自動初期化コンポーネント
 * 認証完了後に getCurrentUser を自動的に呼び出し、
 * Convex DB にユーザーを作成/更新します。
 *
 * サインイン済みユーザーの Convex ユーザーレコードが
 * 確認できるまで children の表示をブロックし、
 * レースコンディションによる "User not found" エラーを防ぎます。
 */
export function UserInitializer({ children }: { children: React.ReactNode }) {
	const { isSignedIn, isLoaded } = useAuth();
	const getCurrentUser = useMutation(api.users.getCurrentUser);
	const initializingRef = useRef(false);
	const [initialized, setInitialized] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Convex ユーザーレコードの存在確認（リアクティブに購読）
	const currentUser = useQuery(
		api.users.getCurrentUserProfile,
		isLoaded && isSignedIn ? {} : "skip",
	);

	useEffect(() => {
		if (initializingRef.current || initialized) {
			return;
		}

		// Clerk の読み込みが完了し、かつサインイン済みの場合のみ実行
		if (isLoaded && isSignedIn) {
			initializingRef.current = true;
			setError(null);

			getCurrentUser()
				.then(() => {
					setInitialized(true);
					initializingRef.current = false;
				})
				.catch((err) => {
					console.error("Failed to initialize user:", err);
					const errorMessage =
						err instanceof Error
							? err.message
							: "ユーザーの初期化に失敗しました";
					setError(errorMessage);
					initializingRef.current = false;
					// エラー時は再試行可能にする
					setTimeout(() => {
						setInitialized(false);
					}, 3000);
				});
		}
	}, [isLoaded, isSignedIn, getCurrentUser, initialized]);

	// サインアウト時にリセット
	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			setInitialized(false);
			initializingRef.current = false;
		}
	}, [isLoaded, isSignedIn]);

	// エラーがある場合は表示（children もレンダリングする）
	if (error) {
		return (
			<>
				<div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
					<strong className="font-bold">エラー: </strong>
					<span className="block sm:inline">{error}</span>
				</div>
				{children}
			</>
		);
	}

	// Clerk 未ロードの場合はそのまま children を表示
	if (!isLoaded) {
		return <>{children}</>;
	}

	// 未サインインの場合はそのまま children を表示
	if (!isSignedIn) {
		return <>{children}</>;
	}

	// 認証が必要なページで、Convex ユーザー初期化完了まで待機
	if (!initialized && currentUser === undefined) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
					<p className="text-muted-foreground text-sm">読み込み中...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
