  const fs = require('fs');
  const brain = require('brain.js');

  // args
  if (process.argv.length < 4) {
    console.error("Need 2 arguments: maxLines maxIterations (outputFilename)");
    process.exit(1);
  }  
  const maxLines = process.argv[2];
  const maxIterations = process.argv[3];
  var outputFilename;
  if (process.argv.length > 4) {
    outputFilename = process.argv[4];
  } else {
    outputFilename = "./hatsune-training-data.json"
  }

  // read
  var i = 0;
  const trainingInputData = [];
  const allFileContents = fs.readFileSync('./corpus/hatsune_miku_lyrics_4k.txt', 'utf-8');
  allFileContents.split(/\r?\n/).every(line =>  {
    i++;
    console.log(`Line from file: ${line}`);
    trainingInputData.push(line);
    if (i >= maxLines) {
        return false;
    }
    return true;
  });
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The list uses approximately ${Math.round(used * 100) / 100} MB`);
  console.log(`The list is ${trainingInputData.length} lines long`);

  // train
  const lstm = new brain.recurrent.LSTM();
  const result = lstm.train(trainingInputData, {
    iterations: maxIterations,
    log: details => console.log(details),
    errorThresh: 0.011
  });

  // store
  const trainingOutputData = lstm.toJSON();
  fs.writeFileSync(outputFilename, JSON.stringify(trainingOutputData));
  console.log("Wrote to: " + outputFilename);