var funcCreeps = require("func.creeps");

var jobHauler = {
    /** @param {Creep} creep **/
    run : function(creep, debug){
      // tell job
      if (debug == 2) creep.say("🏎️");

      // refill if necessary
      if(creep.store.getUsedCapacity() == 0){
        if (debug == 1) creep.say("⚡");
        var containers = creep.room.find(FIND_STRUCTURES, {filter: (structure)=>(structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50)});
        var container = creep.pos.findClosestByRange(containers);
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveTo(container, {visualizePathStyle: {stroke: "#e0f015"}});
        }
      }

      else{
        // transfer (find target)
        var targets = creep.room.find(FIND_STRUCTURES, {filter: (structure) => (((structure.structureType == STRUCTURE_SPAWN)||
                                                                                (structure.structureType == STRUCTURE_EXTENSION))&&
                                                                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)});

        var target = creep.pos.findClosestByRange(targets, {filter: (structure) => (structure.structureType == STRUCTURE_SPAWN)});
        if (!target) target = creep.pos.findClosestByRange(targets, {filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION)});

        // no target, going to sleep
        if (!target){
          funcCreeps.sleep(creep, debug);
        }

        // target, going to transfer
        else {
          if (debug == 1) creep.say("⚡➡️"+target.structureType);
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(target, {visualizePathStyle : {stroke: "#1232f3"}});
          }
        }
      }
    }
};

module.exports = jobHauler;