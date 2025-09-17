import { Container, Typography } from "@mui/material";
import { UrlCleaner } from "./components/UrlCleaner";

export default function Home() {
  return (
    <Container>
      <UrlCleaner />
      <Typography color="black">Dive Deeper</Typography>
    </Container>
  );
}
