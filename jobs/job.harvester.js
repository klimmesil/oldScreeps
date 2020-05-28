var funcCreeps = require("func.creeps");

var jobHarvester = {
    /** @param {Creep} creep **/
    run : function(creep, debug){
      //tell job
      if (debug == 2) creep.say("🌾");

      /** tranfering **/
      if (creep.store.getFreeCapacity() == 0){
        var targets = creep.room.find(FIND_STRUCTURES, {filter: (structure) => (((structure.structureType == STRUCTURE_SPAWN)||
                                                                                (structure.structureType == STRUCTURE_EXTENSION)||
                                                                                (structure.structureType == STRUCTURE_CONTAINER))&&
                                                                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)});

        var target = creep.pos.findClosestByRange(targets, {filter: (structure) => (structure.structureType == STRUCTURE_SPAWN)});
        if (!target) target = creep.pos.findClosestByRange(targets, {filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION)});
        if (!target) target = creep.pos.findClosestByRange(targets, {filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER)});

        if (debug == 1){
          if (!target) funcCreeps.sleep(creep, debug);
          else creep.say("⚡➡️"+target.structureType);
        }
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveTo(target, {visualizePathStyle : {stroke: "#1232f3"}});
        }
      }

      /** going to harvest **/
      else {
        if (debug == 1) creep.say("⚡");
        var localSource = creep.pos.findClosestByRange(FIND_SOURCES, {filter: (source) => (source.energy >= 50)});
        if (creep.harvest(localSource) == ERR_NOT_IN_RANGE){
          creep.moveTo(localSource, {visualizePathStyle : {stroke: "#e0f015"}});
        }
      }
    }
};

module.exports = jobHarvester;
