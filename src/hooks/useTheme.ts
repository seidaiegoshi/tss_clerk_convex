import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect } from "react";

import { api } from "../../convex/_generated/api";
import {
	type ResolvedTheme,
	type Theme,
	useThemeContext,
} from "../contexts/ThemeContext";

export type { ResolvedTheme, Theme };

export function useTheme() {
	const { isSignedIn } = useAuth();
	const userProfile = useQuery(
		api.users.getCurrentUserProfile,
		isSignedIn ? {} : "skip",
	);
	const updatePreferences = useMutation(api.users.updateUserPreferences);

	const { theme, resolvedTheme, setTheme: setThemeContext } = useThemeContext();

	// ユーザープロファイルからテーマを読み込み（現在と異なる場合のみ）
	useEffect(() => {
		if (userProfile?.preferences?.theme) {
			const userTheme = userProfile.preferences.theme as Theme;
			if (userTheme !== theme) {
				setThemeContext(userTheme);
			}
		}
	}, [userProfile, setThemeContext, theme]);

	const setTheme = useCallback(
		async (newTheme: Theme) => {
			// DB に保存するだけ。Convex のリアクティブクエリで
			// userProfile が更新され、useEffect 経由でテーマが適用される
			if (isSignedIn) {
				try {
					await updatePreferences({
						preferences: { theme: newTheme },
					});
				} catch (error) {
					console.error("Failed to save theme preference:", error);
				}
			}
		},
		[isSignedIn, updatePreferences],
	);

	const toggleTheme = useCallback(() => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
	}, [theme, setTheme]);

	return {
		theme,
		resolvedTheme,
		setTheme,
		toggleTheme,
	};
}
