/** All jobs */
var jobHarvester = require('job.harvester');
var jobUpgrader = require('job.upgrader');
var jobBuilder = require('job.builder');
var jobMiner = require('job.miner');
var jobHauler = require('job.hauler');
var jobReserver = require('job.reserver');

//** All functions **/
var funcDebug = require('func.debug');
var funcStruct = require('func.structures');
var funcCreeps = require("func.creeps");

/** Management **/
var manageCrew = require("manage.crew");

module.exports.loop = function(){
  /** debugging **/
  console.log("________________________________________________" + Game.time);
  funcDebug.markDamaged(Game.spawns["Spawn1"].room);

  /** Management **/
  manageCrew.deaths();
  manageCrew.respawn(Game.spawns["Spawn1"]);
  manageCrew.reorganize(Game.spawns["Spawn1"].room);

  /** Screeps **/
  for (var name in Game.creeps){

    var creep = Game.creeps[name];
    var job = creep.memory.job

    switch (job){
      case "harvester":
        jobHarvester.run(creep, 2);
        break;

      case "upgrader":
        jobUpgrader.run(creep, 2);
        break;

      case "builder":
        jobBuilder.run(creep, 2);
        break;

      case "miner":
        jobMiner.run(creep, 2);
        break;

      case "hauler":
        jobHauler.run(creep, 2);
        break;

      case "reserver":
        jobReserver.run(creep, 2);
        break

      case "mob":
        var target = Game.flags.mob;
        console.log("mob debugging : " + creep.moveTo(target));
        break;
    }
  }

}
