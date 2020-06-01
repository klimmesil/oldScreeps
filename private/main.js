// all jobs
var jobObjects = {
  harvester: require("job.harvester")
};

// all functions
var funcCreeps = require("func.creeps");
var funcStruct = require("func.structures");
var funcTravel = require("func.travel");
var funcDebug = require("func.debug");

// all constants
var debugging = {
  harvester: 1
};

// main paragraph
module.exports.loop = {
  // debug
  console.log("________" + Game.time + "______________________________________________");

  // manage things

  // apply jobs
  for (var name in Game.creeps){
    var creep = Game.creeps[name];
    var job = creep.memory.job;

    jobObjects[job].run(creep, debug);
  }
}
