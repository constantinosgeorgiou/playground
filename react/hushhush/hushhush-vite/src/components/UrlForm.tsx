import { useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

interface UrlFormProps {
	url: string;
	error: string;
	onUrlChange: (value: string) => void;
	onSubmit: (e: FormEvent) => void;
}

export default function UrlForm({ url, error, onUrlChange, onSubmit }: UrlFormProps) {
	const formRef = useRef<HTMLFormElement>(null);
	const hasError = Boolean(error);

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			formRef.current?.requestSubmit();
		}
	};

	return (
		<form ref={formRef} onSubmit={onSubmit}>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="stretch">
				<TextField
					fullWidth
					required
					id="url-input"
					label="Link"
					type="text"
					value={url}
					onChange={(e) => onUrlChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Enter your link here..."
					autoComplete="off"
					inputMode="url"
					variant="outlined"
					error={hasError}
					multiline
				/>
				<Button type="submit" variant="contained" size="medium" aria-label="Clean link" title="Clean link">
					Clean link
				</Button>
			</Stack>
			{error && (
				<Alert severity="error" sx={{ mt: 2 }}>
					{error}
				</Alert>
			)}
		</form>
	);
}
