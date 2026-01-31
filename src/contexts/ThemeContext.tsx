import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "app-theme";

interface ThemeContextValue {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "light";
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === "light" || stored === "dark" || stored === "system") {
		return stored;
	}
	return "light";
}

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") return;

	const resolved = theme === "system" ? getSystemTheme() : theme;
	const root = document.documentElement;

	root.classList.toggle("dark", resolved === "dark");
	root.dataset.theme = theme;
	root.dataset.resolvedTheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// hydration 安全: SSR・クライアント両方で "light" 固定。
	// 実際のテーマは __root.tsx のインラインスクリプト（FOUC防止）と
	// 下の useEffect（React state 同期）で適用する。
	const [theme, setThemeState] = useState<Theme>("light");
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

	// hydration 後に localStorage の保存値で React state を同期
	useEffect(() => {
		const stored = getStoredTheme();
		const resolved = stored === "system" ? getSystemTheme() : stored;
		setThemeState(stored);
		setResolvedTheme(resolved);
		applyTheme(stored);
	}, []);

	// テーマ変更時にDOMに適用
	useEffect(() => {
		applyTheme(theme);
		setResolvedTheme(theme === "system" ? getSystemTheme() : theme);
	}, [theme]);

	// システムテーマ変更を監視
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			applyTheme("system");
			setResolvedTheme(getSystemTheme());
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		applyTheme(newTheme);
		setResolvedTheme(newTheme === "system" ? getSystemTheme() : newTheme);
		localStorage.setItem(THEME_STORAGE_KEY, newTheme);
	};

	return (
		<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useThemeContext() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useThemeContext must be used within a ThemeProvider");
	}
	return context;
}
