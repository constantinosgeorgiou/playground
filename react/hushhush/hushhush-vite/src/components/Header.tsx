import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function Header() {
	return (
		<AppBar position="static" color="primary" enableColorOnDark>
			<Toolbar>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					HushHush
				</Typography>
				<Typography variant="body2" sx={{ opacity: 0.9 }}>
					Remove source identifiers from links
				</Typography>
			</Toolbar>
		</AppBar>
	);
}
