import { useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { AlertTitle } from "@mui/material";

interface UrlFormProps {
  url: string;
  error: string;
  onUrlChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function UrlForm({
  url,
  error,
  onUrlChange,
  onSubmit,
}: UrlFormProps) {
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="stretch"
      >
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
        <Button
          type="submit"
          variant="contained"
          size="medium"
          aria-label="Clean link"
          title="Clean link"
          sx={{ fontWeight: 'bold', lineHeight: 1.5 }}
        >
          Clean link
        </Button>
      </Stack>
      {error && (
        <Alert severity="warning" variant="outlined" sx={{ mt: 3 }}>
          <AlertTitle variant="h6">Warning</AlertTitle>
          {error.split("\n").map((errorMsg, i) => (
            <Typography variant="body1" key={i} sx={{ my: 2 }}>
              {errorMsg}
            </Typography>
          ))}
        </Alert>
      )}
    </form>
  );
}
