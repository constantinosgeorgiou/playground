"use client";

import { use, useState } from "react";
import {
  removeSourceIdentifiers,
  type CleanUrlResult,
  validateUrl,
  generateResultsList,
} from "../utils/urlUtils";
import UrlForm from "./UrlForm";
import ResultsList from "./ResultsList";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

function UrlCleaner() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<CleanUrlResult[]>([]);
  const [error, setError] = useState("");

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    let validUrl = "";

    try {
      validUrl = validateUrl(url);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        setResults([]);
      }
      return;
    }

    setResults(generateResultsList(new URL(validUrl)));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ bgcolor: (t) => t.palette.background.default }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <UrlForm
          url={url}
          error={error}
          onUrlChange={setUrl}
          onSubmit={handleUrlSubmit}
        />
        <ResultsList results={results} onCopy={copyToClipboard} />
      </Container>
    </Box>
  );
}
export { UrlCleaner };
