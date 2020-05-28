var funcCreeps = require("func.creeps");

var jobUpgrader = {
    /** @param {Creep} creep **/
    run : function(creep, debug){
      // tell job
      if (debug == 2) creep.say("⏫");

      // deciding if upping or filling
      if (creep.memory.upping && creep.store.getUsedCapacity() == 0){
        creep.memory.upping = false;
      } else if (!creep.memory.upping && creep.store.getFreeCapacity() == 0){
        creep.memory.upping = true;
      }

      if (!creep.memory.upping){
        if (debug == 1) creep.say("⚡");
        var source = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter : (structure) => (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity())});
        if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          creep.moveTo(source, {visualizePathStyle : {stroke : "#e0f015"}});
        }

        // go sleep
        if (!source){
          funcCreeps.sleep(creep,debug);
        }
      } else {
        if (debug == 1) creep.say("⏫");
        var controller = creep.room.controller;
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE){
          creep.moveTo(controller, {visualizePathStyle : {stroke : "#1232f3"}});
        }
      }
    }
};

module.exports = jobUpgrader;
