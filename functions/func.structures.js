var funcStruct = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // tells if the structure is watched by a miner
  watched: function (structure){
    return(Memory.miningSites[structure.id] != undefined &&
      Memory.miningSites[structure.id].miner != null &&
      Memory.miningSites[structure.id].energy == RESOURCE_ENERGY);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // gives all the default requesters (ext, spawn)
  getRequesters: function (creep){
    var targets = creep.room.find(FIND_STRUCTURES, {filter: (structure) => (((structure.structureType == STRUCTURE_SPAWN)||
                                                                            (structure.structureType == STRUCTURE_EXTENSION))&&
                                                                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)});


    return targets;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // gives you all the broken
  getBroken: function(room){
    var f = function(s){
      return (
        s.hits < s.hitsMax && // broken
        (s.hits < Memory.repairConditions[s.structureType].start) // go see Memory.repairConditions
      );
    }

    var targets = room.find(FIND_STRUCTURES, {filter: f});
    return targets;
  }
};

module.exports = funcStruct;
