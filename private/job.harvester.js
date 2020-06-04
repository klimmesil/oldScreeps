var funcCreeps = require("func.creeps");

var jobHarvester = {
  run : function(creep, debug){
    // say job
    if (debug == 2) creep.say("🌾");

    // go mine
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
      var target = creep.pos.findClosestByRange(FIND_SOURCES);
      if (creep.harvest(target) == ERR_NOT_IN_RANGE){
        creep.moveTo(target, {visualizePathStyle: {stroke: "#f1c40f"}});
      }
    }

    // transfer
    else {
      var spawn = Game.spawns.Spawn1;
      if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        creep.moveTo(spawn, {visualizePathStyle: {stroke: "#f1c40f"}});
      }
    }
  }
}

module.exports = jobHarvester;
