// taxcy

// calc: Calculate the Cyprus Personal Income Tax (PIT)
// -m, --monthly <salary>
// -a, --annual <salary>
// -13, --is-13-month

// info: Display a table lists the PIT rates and bands currently applicable to individuals.


use rusty_money::{Money, iso};
use cli_table::{print_stdout, Table};

#[derive(Table)]
struct PersonalIncomeTax {
    #[table(title = "From")]
    from: Money<'static, iso::Currency>,
    #[table(title = "To")]
    to: Money<'static, iso::Currency>,
    #[table(title = "Tax rate (%)")]
    rate: f64,
}

fn info(pits: Vec<PersonalIncomeTax>) {
    print_stdout(pits);
}

fn main() {
    let mut pit_rates: Vec<PersonalIncomeTax> = Vec::new();

    pit_rates.push(PersonalIncomeTax {
        from: Money::from_major(0, iso::EUR),
        to: Money::from_major(19500, iso::EUR),
        rate: 0.00,
    });
    pit_rates.push(PersonalIncomeTax {
        from: Money::from_major(19501, iso::EUR),
        to: Money::from_major(28000, iso::EUR),
        rate: 0.20,
    });
    pit_rates.push(PersonalIncomeTax {
        from: Money::from_major(28001, iso::EUR),
        to: Money::from_major(36300, iso::EUR),
        rate: 0.25,
    });
    pit_rates.push(PersonalIncomeTax {
        from: Money::from_major(36301, iso::EUR),
        to: Money::from_major(60000, iso::EUR),
        rate: 0.30,
    });
    pit_rates.push(PersonalIncomeTax {
        from: Money::from_major(60001, iso::EUR),
        to: Money::from_major(i64::MAX, iso::EUR),
        rate: 0.35,
    });

    info(pit_rates)
}
