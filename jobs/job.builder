var jobBuilder = {
    /** @param {Creep} creep **/
    run : function(creep){
      // decide wether we are building or harvesting
      if (creep.memory.upping && creep.store.getUsedCapacity() == 0){
        upping = false;
      } else if (!creep.memory.upping && creep.store.getFreeCapacity() == 0 {
        upping = true;
      }

      // either up or down
      if (upping){
        var building = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if (creep.build(building) == ERR_NOT_IN_RANGE){
          creep.moveTo(building, {visualizePathStyle: {stroke: "#af8c0c"}});
        }
      } else {
          var container = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER)});
          if (container){
            if (creep.harvest(container) == ERR_NOT_IN_RANGE){
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
