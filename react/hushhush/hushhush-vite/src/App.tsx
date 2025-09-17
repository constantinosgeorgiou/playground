import { useState } from "react";
import { removeSourceIdentifiers, type CleanUrlResult, validateUrl, generateResultsList } from "./utils/urlUtils";
import Header from "./components/Header";
import UrlForm from "./components/UrlForm";
import ResultsList from "./components/ResultsList";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

function App() {
	const [url, setUrl] = useState("");
	const [results, setResults] = useState<CleanUrlResult[]>([]);
	const [error, setError] = useState("");

	const handleUrlSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const validation = validateUrl(url);
		if (!validation.ok) {
			setError(validation.error ?? "Please enter a valid URL");
			setResults([]);
			return;
		}

		setResults(generateResultsList(url));
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: (t) => t.palette.background.default }}>
			<Header />
			<Container maxWidth="md" sx={{ py: 4 }}>
				<UrlForm url={url} error={error} onUrlChange={setUrl} onSubmit={handleUrlSubmit} />
				<ResultsList results={results} onCopy={copyToClipboard} />
			</Container>
		</Box>
	);
}

export default App;
