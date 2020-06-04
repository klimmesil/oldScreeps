// all jobs
const jobObjects = {
  harvester: require("job.harvester"),
  hauler: require("job.hauler"),
  miner: require("job.miner"),
  upgrader: require("job.upgrader"),
  builder: require("job.builder")
};

// all functions
var funcCreeps = require("func.creeps");
var funcStruct = require("func.structures");
var funcDebug = require("func.debug");

// all managements
var manageCrew = require("manage.crew");
var manageLists = require("manage.lists");
var manageBuilds = require("manage.builds");

// all constants
const debugging = {
  harvester: 1,
  hauler: 1,
  miner: 1,
  upgrader: 1,
  builder: 1,
  damaged: 1,
  sources: 1,
  buildings: 1
};

// main paragraph
module.exports.loop = function() {

  // new tick
  console.log("________" + Game.time + "______________________________________________");

  // manage things
  manageCrew.failSafe();
  manageCrew.deaths();
  manageCrew.respawn(Game.spawns["Spawn1"]);
  manageLists.reorganize();
  manageBuilds.restructure();

  // debug
  funcDebug.markAll(debugging);

  // apply jobs
  for (var name in Game.creeps){
    var creep = Game.creeps[name];
    var job = creep.memory.job;

    if (job !== undefined) jobObjects[job].run(creep, debugging[job]);
  }
}
