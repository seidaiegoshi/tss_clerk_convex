import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export default function HeaderUser() {
	return (
		<>
			<SignedIn>
				<UserButtonWithTheme />
			</SignedIn>
			<SignedOut>
				<SignInButton mode="modal" forceRedirectUrl="/">
					<button type="button">ログイン</button>
				</SignInButton>
			</SignedOut>
		</>
	);
}

function UserButtonWithTheme() {
	const { resolvedTheme, toggleTheme } = useTheme();

	return (
		<UserButton>
			<UserButton.MenuItems>
				<UserButton.Action
					label={
						resolvedTheme === "dark"
							? "ライトモードに切り替え"
							: "ダークモードに切り替え"
					}
					labelIcon={
						resolvedTheme === "dark" ? (
							<Sun className="h-4 w-4" />
						) : (
							<Moon className="h-4 w-4" />
						)
					}
					onClick={toggleTheme}
				/>
				<UserButton.Action label="manageAccount" />
				<UserButton.Action label="signOut" />
			</UserButton.MenuItems>
		</UserButton>
	);
}
