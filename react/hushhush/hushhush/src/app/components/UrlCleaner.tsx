"use client";

import { useState } from "react";
import {
  type CleanUrlResult,
  validateUrl,
  generateCleanUrlResult,
} from "../utils/urlUtils";
import UrlForm from "./UrlForm";
import CleanUrlResultDisplay from "./CleanUrlResultDisplay";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

function UrlCleaner() {
  const [url, setUrl] = useState("");
  const [cleanUrlResult, setCleanUrlResult] = useState<CleanUrlResult>();
  const [error, setError] = useState("");

  const handleQueryParamChange = (paramName: string, isRemoved: boolean) => {
    setCleanUrlResult(currentResult => {
      if (!currentResult) return currentResult;

      const updatedQueryParams = currentResult.queryParams.map(param =>
        param.name === paramName ? { ...param, isRemoved } : param
      );

      const newUrl = new URL(currentResult.url);

      updatedQueryParams.forEach(param => {
        if (!param.isRemoved) {
          newUrl.searchParams.set(param.name, param.value);
        } else {
          newUrl.searchParams.delete(param.name);
        }
      });

      return {
        ...currentResult,
        url: newUrl.toString(),
        queryParams: updatedQueryParams
      };
    });
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    let validUrl = "";

    try {
      validUrl = validateUrl(url);
      setCleanUrlResult(generateCleanUrlResult(new URL(validUrl)));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        setCleanUrlResult(undefined);
      }
      return;
    }
  };

  const copyToClipboard = (text: string) => {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Box sx={{ bgcolor: (t) => t.palette.background.default }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <UrlForm
          url={url}
          error={error}
          onUrlChange={setUrl}
          onSubmit={handleUrlSubmit}
        />
        <CleanUrlResultDisplay result={cleanUrlResult} onCopy={copyToClipboard} handleQueryParamChange={handleQueryParamChange} />
      </Container>
    </Box>
  );
}
export { UrlCleaner };
