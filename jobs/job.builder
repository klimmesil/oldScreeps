var jobBuilder = {
    /** @param {Creep} creep **/
    run : function(creep, debug){
      // decide wether we are building or harvesting
      if (creep.memory.upping && creep.store.getUsedCapacity() == 0){
        creep.memory.upping = false;
      } else if (!creep.memory.upping && creep.store.getFreeCapacity() == 0) {
        creep.memory.upping = true;
      }

      // either up or down
      if (creep.memory.upping){
        // see if someone needs repairs
        var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (structure) => (structure.hits < structure.hitsMax &&
                                                                                            structure.structureType != STRUCTURE_WALL &&
                                                                                            !(structure.structureType == STRUCTURE_CONTAINER && Memory.miningSites[structure.id] && Memory.miningSites[structure.id].miner && Memory.miningSites[structure.id].resource == RESOURCE_ENERGY))});
        if (target) {
          // repair
          if (debug) creep.say("🛠️" + target.structureType);
          if (creep.repair(target) == ERR_NOT_IN_RANGE){
            creep.moveTo(target, {visualizePathStyle: {stroke: "#04eb0b"}});
          }
        } else {
          // build
          target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
          if (debug) creep.say ("🏗️" + target.structureType);
          if (creep.build(target) == ERR_NOT_IN_RANGE){
            creep.moveTo(target, {visualizePathStyle: {stroke: "#04eb0b"}});
          }
        }
      } else {
        if (debug) creep.say("⚡");

        // refill
        var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)});

        if (container){
          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(container, {visualizePathStyle: {stroke: "#e0f015"}});
          }
        } else {
          var source = creep.pos.findClosestByRange(FIND_SOURCES, {filter: (source) => (source.energy >= 50)})
          if (source){
            if (creep.harvest(source) == ERR_NOT_IN_RANGE){
              creep.moveTo(source, {visualizePathStyle: {stroke: "#e0f015"}});
            }
          } else{
            console.log("no sources left");
          }
        }
      }
    }
};

module.exports = jobBuilder;
