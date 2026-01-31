import { useEffect, useState } from "react";

/**
 * メディアクエリにマッチするかを判定するカスタムフック
 * @param query - メディアクエリ文字列(例: "(max-width: 768px)")
 * @returns マッチするかどうか
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		setMatches(media.matches);

		const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [query]);

	return matches;
}
