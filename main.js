/** All jobs */
var jobHarvester = require('job.harvester');
var jobUpgrader = require('job.upgrader');
var jobBuilder = require('job.builder');
var jobMiner = require('job.miner');
var jobHauler = require('job.hauler');

//** All functions **/
var funcDebug = require('func.debug');
var funcStruct = require('func.structures');
var funcCreeps = require("func.creeps");

/** Management **/
var manageCrew = require("manage.crew");

module.exports.loop = function(){

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

      case "mob":
        var target = Game.getObjectById("5ecced7e929e2d96f1d302ca");
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY)==0) creep.withdraw(target, RESOURCE_ENERGY);
        else jobBuilder.run(creep, 1);
        break;
    }
  }

  /** debugging **/
  console.log("________________________________________________" + Game.time);
  funcDebug.markDamaged(Game.spawns["Spawn1"].room);

  /** Management **/
  manageCrew.deaths();
  manageCrew.respawn(Game.spawns["Spawn1"]);
  manageCrew.reorganize(Game.spawns["Spawn1"].room);
}
