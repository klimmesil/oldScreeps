var funcStruct = require("func.structures");
var funcCreeps = require("func.creeps");

var jobBuilder = {
    /** @param {Creep} creep **/
    run : function(creep, debug){
      //tell job
      if (debug == 2) creep.say("🏗️");


      // decide wether we are building or harvesting
      if (creep.memory.upping && creep.store.getUsedCapacity() == 0){
        creep.memory.upping = false;
      } else if (!creep.memory.upping && creep.store.getFreeCapacity() == 0) {
        creep.memory.upping = true;
      }

      // building or repairing
      if (creep.memory.upping){
        // see if someone needs repairs
        var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (structure) => (structure.hits < structure.hitsMax &&
                                                                                             structure.structureType != STRUCTURE_WALL &&
                                                                                           !(funcStruct.watched(structure))   )});
        
        if (target) {
          // repair
          if (debug == 1) creep.say("🛠️" + target.structureType);
          if (creep.repair(target) == ERR_NOT_IN_RANGE){
            creep.moveTo(target, {visualizePathStyle: {stroke: "#04eb0b"}});
          }
        } else {
          // build
          target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
          if(target){
            if (debug == 1 && target) creep.say ("🏗️" + target.structureType);
            if (creep.build(target) == ERR_NOT_IN_RANGE){
              creep.moveTo(target, {visualizePathStyle: {stroke: "#04eb0b"}});
            }
          }

          // sleeping
          else {
            funcCreeps.sleep(creep, debug);
          }

        }
      }

      // refill
      else {
        if (debug == 1) creep.say("⚡");
        var containers = creep.room.find(FIND_STRUCTURES, {filter: (structure)=>(structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50)});
        var container = creep.pos.findClosestByRange(containers);
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveTo(container, {visualizePathStyle: {stroke: "#e0f015"}});
        }

        // TEMPORARY
        if (!container){
          container = creep.pos.findClosestByRange(FIND_SOURCES);
          if (creep.harvest(container) == ERR_NOT_IN_RANGE){
            creep.moveTo(container, {visualizePathStyle: {stroke: "#e0f015"}});
          }
        }
      }
    }
};

module.exports = jobBuilder;
