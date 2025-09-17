use core::panic;
use rand;
use std::io;

fn read_choice(
    prompt: &String,
    available_choices: &[&str],
    retry_times: i32,
    retry_msg: &String,
    error_msg: &String,
) -> Result<String, String> {
    println!("{}: {}", prompt, available_choices.join(", "));

    let mut buffer = String::new();

    for _ in 0..retry_times {
        let _ = io::stdin().read_line(&mut buffer);

        if buffer.ends_with("\n") {
            buffer = buffer.trim().to_string();
        }

        buffer = buffer.to_lowercase();

        if buffer.is_empty() || !available_choices.contains(&buffer.as_str()) {
            println!("{}: {}", retry_msg, available_choices.join(", "));
            buffer = String::from("");
            continue;
        }

        break;
    }

    if buffer.is_empty() {
        return Err(error_msg.to_string());
    }

    return Ok(buffer);
}

fn main() {
    // Accept input from user
    // randomly pick rock paper scissors
    // print outcome based on logic
    // rock
    // paper
    // scissors

    let prompt = String::from("type one of the following");
    let retry_times = 3;
    let retry_msg = String::from("please type one of the following");
    let error_msg = String::from("incorrect choices... giving up on you...");
    let available_choices = ["rock", "paper", "scissors"];
    let choice = match read_choice(
        &prompt,
        &available_choices,
        retry_times,
        &retry_msg,
        &error_msg,
    ) {
        Ok(choice) => choice,
        Err(e) => panic!("{}", e),
    };

    let oponent = available_choices[rand::random_range(0..3)];

    println!("🧑 {} VS {} 🤖", choice, oponent);

    if choice == oponent {
        println!("draw");
    } else if choice == "rock" && oponent == "scissors"
        || choice == "paper" && oponent == "rock"
        || choice == "scissors" && oponent == "paper"
    {
        println!("🏆 you win! {} beats {}", choice, oponent);
    } else {
        println!("❌ you loose! {} beats {}", oponent, choice);
    }
}
