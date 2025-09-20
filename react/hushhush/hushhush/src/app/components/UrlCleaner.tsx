"use client";

import { use, useState } from "react";
import {
  type CleanUrlResult,
  validateUrl,
  generateResultsList,
  generateCleanUrlResult,
} from "../utils/urlUtils";
import UrlForm from "./UrlForm";
import ResultsList from "./ResultsList";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

function UrlCleaner() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<CleanUrlResult[]>([]);
  const [error, setError] = useState("");

  const handleQueryParamChange = (paramName: string, isRemoved: boolean) => {
    setResults(currentResults => 
      currentResults.map(result => {
        const updatedQueryParams = result.queryParams.map(param => 
          param.name === paramName ? { ...param, isRemoved } : param
        );

        const newUrl = new URL(result.url);

        updatedQueryParams.forEach(param => {
          if (!param.isRemoved) {
            newUrl.searchParams.set(param.name, param.value);
          } else {
            newUrl.searchParams.delete(param.name);
          }
        });

        return {
          ...result,
          url: newUrl.toString(),
          queryParams: updatedQueryParams
        };
      })
    );
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    let validUrl = "";

    try {
      validUrl = validateUrl(url);
      console.log("validURL", validUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        setResults([]);
      }
      return;
    }

    setResults([generateCleanUrlResult(new URL(validUrl))]);
  };

  const copyToClipboard = (text: string) => {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
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
        <ResultsList results={results} onCopy={copyToClipboard} handleQueryParamChange={handleQueryParamChange} />
      </Container>
    </Box>
  );
}
export { UrlCleaner };
