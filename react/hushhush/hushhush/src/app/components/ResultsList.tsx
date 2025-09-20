import type { CleanUrlResult } from "../utils/urlUtils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import { GpsFixed, GpsNotFixed } from "@mui/icons-material";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import RemoveCircleOutlineSharpIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import CheckCircleOutlineSharpIcon from '@mui/icons-material/CheckCircleOutlineSharp';

interface ResultsProps {
  results: CleanUrlResult[];
  onCopy: (text: string) => void;
}

function QueryParamsList({
  params,
}: {
  params: NonNullable<CleanUrlResult["queryParams"]>;
}) {
  if (params.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: "italic", mt: 1 }}
      >
        No query parameters
      </Typography>
    );
  }
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Query Parameters
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="Query Parameters Table">
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Parameter</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {params.map((param, index) => (
              <TableRow key={param.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{param.isSourceIdentifier ? <RemoveCircleOutlineSharpIcon color="error" /> : <CheckCircleOutlineSharpIcon color="info" />}</TableCell>
                <TableCell>{param.name}</TableCell>
                <TableCell>{param.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Query Parameters
      </Typography>
      <Stack spacing={1}>
        {params.map((param, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            <Chip
              label={param.name}
              color={param.isSourceIdentifier ? "error" : "primary"}
              size="small"
            />
            <Typography variant="body2">= {param.value}</Typography>
            {param.isSourceIdentifier && (
              <Chip
                label="Source ID"
                color="error"
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function ResultsListItem({
  result,
  onCopy,
}: {
  result: CleanUrlResult;
  onCopy: (text: string) => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor:
          result.confidence === "exact" ? "success.light" : "warning.light",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{ mb: 1 }}
        >
          <Chip
            label={
              result.confidence === "exact"
                ? "Exact Result"
                : "Approximate Result"
            }
            icon={
              result.confidence === "exact" ? <GpsFixed /> : <GpsNotFixed />
            }
            color={result.confidence === "exact" ? "success" : "warning"}
            size="small"
          />
          {result.platform && (
            <Chip label={result.platform.name} color="secondary" size="small" />
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ my: 4 }}
        >
          <Link
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            variant="body2"
            sx={{ wordBreak: "break-all", flex: 1, fontSize: "1.3em" }}
          >
            {result.url}
          </Link>

          {window.isSecureContext && (
            <IconButton
              aria-label="Copy URL"
              onClick={() => onCopy(result.url)}
              size="small"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <QueryParamsList params={result.queryParams} />
      </CardContent>
    </Card>
  );
}

export default function ResultsList({ results, onCopy }: ResultsProps) {
  if (results.length === 0) return null;
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Results
      </Typography>
      <Stack spacing={2}>
        {results.map((r, i) => (
          <ResultsListItem key={i} result={r} onCopy={onCopy} />
        ))}
      </Stack>
    </Box>
  );
}
