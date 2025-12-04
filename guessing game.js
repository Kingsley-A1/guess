// A progressive difficulty guessing game by King - Production Ready Version

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to ask a question and return a promise
function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// The function that plays one level and RETURNS true for a win, false for a loss
async function playLevel(level) {
    let maxNumber;
    let guessLimit;

    // Set difficulty based on the level passed into the function
    switch (level) {
        case 1:
            maxNumber = 10;
            guessLimit = 5;
            break;
        case 2:
            maxNumber = 50;
            guessLimit = 7;
            break;
        case 3:
            maxNumber = 100;
            guessLimit = 10;
            break;
        case 4:
            maxNumber = 200;
            guessLimit = 12;
            break;
        case 5:
            maxNumber = 500;
            guessLimit = 15;
            break;
        case 6:
            maxNumber = 1000;
            guessLimit = 18;
            break;
        case 7:
            maxNumber = 2000;
            guessLimit = 20;
            break;
        case 8:
            maxNumber = 5000;
            guessLimit = 22;
            break;
        case 9:
            maxNumber = 10000;
            guessLimit = 25;
            break;
        case 10:
            maxNumber = 50000;
            guessLimit = 30;
            break;
        case 11:
            maxNumber = 100000;
            guessLimit = 35;
            break;
        case 12:
            maxNumber = 200000;
            guessLimit = 40;
            break;
        case 13:
            maxNumber = 500000;
            guessLimit = 45;
            break;
        case 14:
            maxNumber = 1000000;
            guessLimit = 50;
            break;
        case 15:
            maxNumber = 2000000;
            guessLimit = 55;
            break;
        case 16:
            maxNumber = 5000000;
            guessLimit = 60;
            break;
        case 17:
            maxNumber = 10000000;
            guessLimit = 65;
            break;
        case 18:
            maxNumber = 20000000;
            guessLimit = 70;
            break;
        case 19:
            maxNumber = 50000000;
            guessLimit = 75;
            break;
        case 20:
            maxNumber = 100000000;
            guessLimit = 80;
            break;
        default:
            maxNumber = 10;
            guessLimit = 5;
    }

    const secretNumber = Math.floor(Math.random() * maxNumber) + 1;
    let guessesTaken = 1;

    let userGuessStr = await ask(`Level ${level}: Guess a number from 1 to ${maxNumber}. You have ${guessLimit} tries. `);
    let userGuess = parseInt(userGuessStr);

    // Validate input
    while (isNaN(userGuess) || userGuess < 1 || userGuess > maxNumber) {
        console.log("Invalid input. Please enter a number between 1 and " + maxNumber + ".");
        userGuessStr = await ask("Try again: ");
        userGuess = parseInt(userGuessStr);
    }

    // The game loop for this level
    while (userGuess !== secretNumber && guessesTaken < guessLimit) {
        if (userGuess > secretNumber) {
            console.log("Too high!");
        } else {
            console.log("Too low!");
        }
        let guessesLeft = guessLimit - guessesTaken;
        userGuessStr = await ask(`You have ${guessesLeft} guesses left. Try again: `);
        userGuess = parseInt(userGuessStr);

        // Validate input
        while (isNaN(userGuess) || userGuess < 1 || userGuess > maxNumber) {
            console.log("Invalid input. Please enter a number between 1 and " + maxNumber + ".");
            userGuessStr = await ask("Try again: ");
            userGuess = parseInt(userGuessStr);
        }

        guessesTaken++;
    }

    // The outcome and RETURN statement
    if (userGuess === secretNumber) {
        console.log(`Congratulations! You beat Level ${level}!`);
        return true; // Return a WIN
    } else {
        console.log(`Sorry, you ran out of guesses. The number was ${secretNumber}. Try this level again.`);
        return false; // Return a LOSS
    }
}

// --- The Main Game Manager ---
async function main() {
    console.log("Welcome to the Progressive Guessing Game! Beat all 20 levels to become a champion.");
    let currentLevel = 1;

    while (currentLevel <= 20) { // Loop as long as there are levels to play
        // Call the function for the current level and store the result
        const playerWon = await playLevel(currentLevel);

        // If the player won, advance to the next level
        if (playerWon === true) {
            currentLevel++;
        }
    }

    // This message only appears after they beat level 20
    console.log("Wow! You have beaten all 20 levels. You are a true champion!");
    rl.close();
}

main();