import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "./ui/button";

export function ThemeToggle() {
	const { resolvedTheme, toggleTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label={
				resolvedTheme === "dark"
					? "ライトモードに切り替え"
					: "ダークモードに切り替え"
			}
		>
			{resolvedTheme === "dark" ? (
				<Sun className="h-5 w-5" />
			) : (
				<Moon className="h-5 w-5" />
			)}
		</Button>
	);
}
