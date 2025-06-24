use std::i32;

use clap::{Parser, Subcommand, ValueEnum};

struct PersonalIncomeTax {
    from: i32,
    to: i32,
    rate: f64,
}

#[derive(Parser)]
#[command(version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Displays tax info.
    Info {},
    /// Calculates income tax.
    Calc {
        salary: i32,
        #[arg(short, long)]
        /// The type of salary.
        r#type: SalaryType,
        #[arg(long("include-13-month"))]
        /// When the given salary includes a 13th month salary.
        include13month: bool,
    },
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum)]
enum SalaryType {
    Annual,
    Monthly,
    // Weekly,
    // Daily,
    // Hourly,
}

fn calc(salary: &i32, r#type: &SalaryType, include13month: &bool, pits: &Vec<PersonalIncomeTax>) {
    
    for pit in pits{

    }
}

fn info(pits: &Vec<PersonalIncomeTax>) {
    for pit in pits {
        println!("{} {} {}", pit.from, pit.to, pit.rate)
    }
}

fn init_pits() -> Vec<PersonalIncomeTax> {
    let mut pits: Vec<PersonalIncomeTax> = Vec::new();

    pits.push(PersonalIncomeTax {
        from: 0,
        to: 1950000,
        rate: 0.00,
    });
    pits.push(PersonalIncomeTax {
        from: 1950001,
        to: 2800000,
        rate: 0.20,
    });
    pits.push(PersonalIncomeTax {
        from: 2800001,
        to: 3630000,
        rate: 0.25,
    });
    pits.push(PersonalIncomeTax {
        from: 3630001,
        to: 6000000,
        rate: 0.30,
    });
    pits.push(PersonalIncomeTax {
        from: 6000001,
        to: i32::MAX,
        rate: 0.30,
    });

    return pits;
}

fn main() {
    let cli = Cli::parse();

    let pits = init_pits();

    match &cli.command {
        Some(Commands::Info {}) => {
            info(&pits);
        }
        Some(Commands::Calc {
            salary,
            r#type,
            include13month,
        }) => {
            calc(salary, r#type, include13month, &pits);
        }
        None => {}
    }
}
