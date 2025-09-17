use clap::Parser;
use cli_clipboard;

/// Search for a pattern in a file and display the lines that contain it.
#[derive(Parser)]
struct Cli {
    /// The path to the file to read
    path: std::path::PathBuf,
}

fn main() {
    let args = Cli::parse();

    let copypath = args.path.into_os_string().into_string().unwrap();

    println!("coping {:?}", copypath.clone());

    cli_clipboard::set_contents(copypath).unwrap();
}
