use clap::{Parser, Subcommand, ValueEnum};
use num_traits::ToPrimitive;
use rusty_money::{FormattableCurrency, Money, iso};

struct PersonalIncomeTax<'a, C: FormattableCurrency> {
    from: Money<'a, C>,
    to: Money<'a, C>,
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
        salary: String,
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

fn calc<C: FormattableCurrency>(
    salary: &Money<C>,
    r#type: &SalaryType,
    include13month: &bool,
    pits: &Vec<PersonalIncomeTax<C>>,
) {
    let mut remaining = salary.amount().to_f64().unwrap();
    let mut total_tax = 0.0;
    for pit in pits {
        let from = pit.from.amount().to_f64().unwrap();
        let to = pit.to.amount().to_f64().unwrap();

        if pit.from < *salary && *salary < pit.to {
            let tax = salary.;
            total_tax += tax;
        }

        if remaining <= 0.0 {
            break;
        }
        let upper = if to < 0.0 {
            remaining
        } else {
            to.min(remaining)
        };
        if upper > from {
            let taxable = upper - from;
            let tax = taxable * pit.rate;
            total_tax += tax;
        }
    }
    println!("Total tax: {:.2}", total_tax);
}

fn info<C: FormattableCurrency>(pits: &Vec<PersonalIncomeTax<C>>) {
    for pit in pits {
        println!("{} {} {}", pit.from, pit.to, pit.rate)
    }
}

fn init_pits<'a>() -> Vec<PersonalIncomeTax<'a, iso::Currency>> {
    let mut pits: Vec<PersonalIncomeTax<'a, iso::Currency>> = Vec::new();

    pits.push(PersonalIncomeTax {
        from: Money::from_major(0, iso::EUR),
        to: Money::from_major(19500, iso::EUR),
        rate: 0.00,
    });
    pits.push(PersonalIncomeTax {
        from: Money::from_major(19500, iso::EUR),
        to: Money::from_major(28000, iso::EUR),
        rate: 0.20,
    });
    pits.push(PersonalIncomeTax {
        from: Money::from_major(28000, iso::EUR),
        to: Money::from_major(36300, iso::EUR),
        rate: 0.25,
    });
    pits.push(PersonalIncomeTax {
        from: Money::from_major(36300, iso::EUR),
        to: Money::from_major(60000, iso::EUR),
        rate: 0.30,
    });
    pits.push(PersonalIncomeTax {
        from: Money::from_major(60000, iso::EUR),
        to: Money::from_major(-1, iso::EUR),
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
            let salary_money = match Money::from_str(salary, iso::EUR) {
                Ok(m) => m,
                Err(e) => {
                    eprintln!("Failed to parse salary: {}", e);
                    std::process::exit(1);
                }
            };
            calc(&salary_money, r#type, include13month, &pits);
        }
        None => {}
    }
}
