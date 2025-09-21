import { AppBar, Typography } from "@mui/material";

export default function NavBar() {
  return (
    <AppBar position="static" sx={{ py: 4, px: 2 }}>
      <Typography>Hush</Typography>
    </AppBar>
  );
}
