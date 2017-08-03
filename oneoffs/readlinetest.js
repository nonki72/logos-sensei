var readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
	console.log("line1 "+input);
});
rl.on('line', (input) => {
	console.log("line2 "+input);
});
rl.prompt();