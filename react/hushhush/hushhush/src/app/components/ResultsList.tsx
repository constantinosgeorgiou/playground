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
import { Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import RemoveCircleOutlineSharpIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import CheckCircleOutlineSharpIcon from '@mui/icons-material/CheckCircleOutlineSharp';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Predefined colors for consistency and good contrast
const paramColors = [
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#F44336', // Red
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FF4081', // Pink
  '#673AB7', // Deep Purple
  '#009688', // Teal
  '#FFC107'  // Amber
];

const getColorForParam = (paramName: string) => {
  // Use a simple hash function to get a consistent index for each parameter name
  const hash = paramName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return paramColors[Math.abs(hash) % paramColors.length];
};

const QueryParamHighlight = styled('span')<{ isactive: string; paramname: string }>(
  ({ theme, isactive, paramname }) => {
    const baseColor = getColorForParam(paramname);
    return {
      backgroundColor: isactive === 'true' ? alpha(baseColor, 0.2) : 'transparent',
      borderRadius: theme.shape.borderRadius,
      padding: '2px 4px',
      color: isactive === 'true' ? baseColor : 'inherit',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      border: isactive === 'true' ? `1px solid ${alpha(baseColor, 0.3)}` : '1px solid transparent',
    };
  }
);

const highlightQueryParams = (url: string, queryParams: NonNullable<CleanUrlResult["queryParams"]>) => {
  let highlightedUrl = url;
  const urlObj = new URL(url);

  queryParams.forEach(param => {
    if (!param.isRemoved) {
      const paramValue = urlObj.searchParams.get(param.name);
      const paramPattern = `${param.name}=${encodeURIComponent(paramValue || '')}`;
      highlightedUrl = highlightedUrl.replace(
        paramPattern,
        `<QueryParamHighlight isactive="true" paramname="${param.name}">${paramPattern}</QueryParamHighlight>`
      );
    }
  });

  return highlightedUrl.split(/(<QueryParamHighlight.*?<\/QueryParamHighlight>)/).map((part, index) => {
    if (part.startsWith('<QueryParamHighlight')) {
      const content = part.match(/>(.*?)</)?.[1] || '';
      const paramMatch = part.match(/paramname="([^"]+)"/);
      const paramName = paramMatch ? paramMatch[1] : '';
      return <QueryParamHighlight key={index} isactive="true" paramname={paramName}>{content}</QueryParamHighlight>;
    }
    return part;
  });
};

interface ResultsProps {
  results: CleanUrlResult[];
  handleQueryParamChange: (paramName: string, isRemoved: boolean) => void;
  onCopy: (text: string) => void;
}

function QueryParamsList({
  params,
  handleQueryParamChange
}: {
  params: NonNullable<CleanUrlResult["queryParams"]>;
  handleQueryParamChange: (paramName: string, isRemoved: boolean) => void;
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
              <TableCell>Removed</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {params.map((param, index) => (
              <TableRow key={param.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Switch checked={param.isRemoved} onChange={(e) => handleQueryParamChange(param.name, e.target.checked)} />
                </TableCell>
                <TableCell>
                  <QueryParamHighlight 
                    isactive={(!param.isRemoved).toString()} 
                    paramname={param.name}
                  >
                    {param.name}
                  </QueryParamHighlight>
                </TableCell>
                <TableCell>
                  <QueryParamHighlight 
                    isactive={(!param.isRemoved).toString()} 
                    paramname={param.name}
                  >
                    {param.value}
                  </QueryParamHighlight>
                </TableCell>
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
  handleQueryParamChange
}: {
  result: CleanUrlResult;
  onCopy: (text: string) => void;
  handleQueryParamChange: (paramName: string, isRemoved: boolean) => void;
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
          <Box
            sx={{
              wordBreak: "break-all",
              flex: 1,
              fontSize: "1.3em"
            }}
          >
            <Link
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                color: 'inherit',
                display: 'inline-block',
                width: '100%'
              }}
            >
              {highlightQueryParams(result.url, result.queryParams)}
            </Link>
          </Box>

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

        <QueryParamsList params={result.queryParams} handleQueryParamChange={handleQueryParamChange} />
      </CardContent>
    </Card>
  );
}

export default function ResultsList({ results, onCopy, handleQueryParamChange }: ResultsProps) {
  if (results.length === 0) return null;
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Results
      </Typography>
      <Stack spacing={2}>
        {results.map((r, i) => (
          <ResultsListItem key={i} result={r} onCopy={onCopy} handleQueryParamChange={handleQueryParamChange} />
        ))}
      </Stack>
    </Box>
  );
}
