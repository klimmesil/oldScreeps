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
  harvester: 0,
  hauler: 0,
  miner: 0,
  upgrader: 1,
  builder: 0,
  damaged: 1,
  sources: 1,
  buildings: 1
};

const workPriorities = {
  harvester: 0,
  hauler: 1,
  miner: 2,
  upgrader: 3,
  builder: 4
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

  // make a work order
  var workOrder = [[],[],[],[],[]];

  for (var name in Game.creeps){
    var job = Memory.creeps[name].job;

    workOrder[workPriorities[job]].push(name);
  }

  // apply jobs
  for (var i in workOrder){
    for (var j in workOrder[i]){
      var name = workOrder[i][j];
      var creep = Game.creeps[name];
      var job = creep.memory.job;

      if (job !== undefined) jobObjects[job].run(creep, debugging[job]);
    }
  }
}
