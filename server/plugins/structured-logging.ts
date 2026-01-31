import { definePlugin } from "nitro";

/**
 * Nitro Server Plugin: 構造化ログ出力
 *
 * Railway向けに console.* を単一行JSON形式で出力する。
 * Railway は stdout の JSON を自動パースし、level フィールドで色分け、
 * カスタム属性で @attributeName:value 検索が可能。
 *
 * フォーマット: {"level":"error","message":"...","timestamp":"...","...":"..."}
 */
export default definePlugin(() => {
	// 開発環境ではオリジナルの console を維持
	if (process.env.NODE_ENV !== "production") {
		return;
	}

	const originalConsole = {
		log: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error,
		debug: console.debug,
	};

	function formatArgs(args: unknown[]): string {
		return args
			.map((arg) => {
				if (arg instanceof Error) {
					return `${arg.message}\n${arg.stack}`;
				}
				if (typeof arg === "object" && arg !== null) {
					try {
						return JSON.stringify(arg);
					} catch {
						return String(arg);
					}
				}
				return String(arg);
			})
			.join(" ");
	}

	function writeStructuredLog(level: string, args: unknown[]) {
		const entry: Record<string, unknown> = {
			level,
			message: formatArgs(args),
			timestamp: new Date().toISOString(),
			service: "app-ssr",
		};

		// Error オブジェクトがあればスタックトレースを別属性に
		for (const arg of args) {
			if (arg instanceof Error) {
				entry.error_name = arg.name;
				entry.error_stack = arg.stack;
				break;
			}
		}

		// 単一行JSON で stdout に出力（Railway が自動パース）
		originalConsole.log(JSON.stringify(entry));
	}

	console.log = (...args: unknown[]) => writeStructuredLog("info", args);
	console.info = (...args: unknown[]) => writeStructuredLog("info", args);
	console.warn = (...args: unknown[]) => writeStructuredLog("warn", args);
	console.error = (...args: unknown[]) => writeStructuredLog("error", args);
	console.debug = (...args: unknown[]) => writeStructuredLog("debug", args);
});
