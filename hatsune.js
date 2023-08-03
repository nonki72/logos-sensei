  const fs = require('fs');
  const brain = require('brain.js');

  // args
  var inputFilename;
  if (process.argv.length > 2) {
    inputFilename = process.argv[2];
  } else {
    inputFilename = "./hatsune-training-data.json"
  }

  // read
  const trainingOutputDataString = fs.readFileSync(inputFilename, 'utf-8');
  const trainingOutputDataJson = JSON.parse(trainingOutputDataString);
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The training data uses approximately ${Math.round(used * 100) / 100} MB`);
 
  // load
  const lstm = new brain.recurrent.LSTM();
  lstm.fromJSON(trainingOutputDataJson);

  // run
  const run1 = lstm.run('The');
  const run2 = lstm.run('Miku');
  const run3 = lstm.run('Spot');
  const run4 = lstm.run('It');
  
  console.log('run 1: The' + run1);
  console.log('run 2: Miku' + run2);
  console.log('run 3: Spot' + run3);
  console.log('run 4: It' + run4);
  