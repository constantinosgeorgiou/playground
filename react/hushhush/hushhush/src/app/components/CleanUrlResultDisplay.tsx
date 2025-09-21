import { useState } from "react";

import type { CleanUrlResult } from "../utils/urlUtils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import { GpsFixed, GpsNotFixed } from "@mui/icons-material";
import { Button, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Zoom } from "@mui/material";
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneAllIcon from '@mui/icons-material/DoneAll';

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
      <Typography variant="h6" component={"h2"} sx={{ my: 4 }}>
        Query Parameters
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="Query Parameters Table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Active</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {params.map((param, index) => (
              <TableRow key={param.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell padding="checkbox">
                  <Switch checked={!param.isRemoved} onChange={(e) => handleQueryParamChange(param.name, !e.target.checked)} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {param.isSourceIdentifier && <Tooltip title="Tracker" placement="top" slots={{ transition: Zoom }} arrow enterTouchDelay={0}>
                      <VisibilityIcon fontSize="small" sx={{}} />
                    </Tooltip>}

                    <QueryParamHighlight
                      isactive={(!param.isRemoved).toString()}
                      paramname={param.name}
                    >
                      {param.name}
                    </QueryParamHighlight>
                  </Stack>
                </TableCell>
                <TableCell>
                  {!param.value.length ? '' : <QueryParamHighlight
                    isactive={(!param.isRemoved).toString()}
                    paramname={param.name}
                  >
                    {param.value}
                  </QueryParamHighlight>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default function CleanUrlResultDisplay({
  result,
  onCopy,
  handleQueryParamChange
}: {
  result?: CleanUrlResult;
  onCopy: (text: string) => void;
  handleQueryParamChange: (paramName: string, isRemoved: boolean) => void;
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    onCopy(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 963);
  };

  if (!result) return null;

  return (
    <Box sx={{ mt: 3 }}>

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
            justifyContent="space-between"
            flexWrap="wrap"
            sx={{ mb: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
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
            {window.isSecureContext && (
              <Button
                aria-label="Copy URL"
                onClick={() => handleCopy(result.url)}
                size="small"
                startIcon={isCopied ? <DoneAllIcon /> : <ContentCopyIcon />}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
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
          </Stack>

          <Divider sx={{ my: 2 }} />

          <QueryParamsList params={result.queryParams} handleQueryParamChange={handleQueryParamChange} />
        </CardContent>
      </Card>
    </Box>
  );
}
