var funcStruct = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // tells if the structure is watched by a miner
  watched: function (structure){
    return (structure.structureType == STRUCTURE_CONTAINER && Memory.containers[structure.id].job == "mining" && Game.creeps[Memory.sources[structure.room.name][Memory.containers[structure.id].source].miner]);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // gives all the default givers (resource, mining containers)
  // opt = {type: res, minVal: int}
  getGivers: function(room, opt){
    // all the dropped resources
    var type = (opt.type?opt.type:RESOURCE_ENERGY);
    var minVal = (opt.min?opt.min:50);
    var requesters = room.find(FIND_DROPPED_RESOURCES, {filter: (r => r.resourceType == type && r.amount >= minVal)});

    // all the sources
    if (type == RESOURCE_ENERGY){
      miningSites = Memory.sources[room.name];

      // for each mining site
      for (var i in miningSites){
        var info = miningSites[i];
        var container = Game.getObjectById(info.container);

        // if there is a container BUILT
        if (container && container.store && container.store.getUsedCapacity(RESOURCE_ENERGY) >= minVal){
          requesters.push(container);
        }
      }
    }

    return requesters;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // gives all the default requesters (ext, spawn)
  // opt = {type: res}
  getRequesters: function (room, opt){
    var targets = room.find(FIND_STRUCTURES, {filter: (structure) => (((structure.structureType == STRUCTURE_SPAWN)||
                                                                            (structure.structureType == STRUCTURE_EXTENSION)||
                                                                             structure.structureType == STRUCTURE_STORAGE||
                                                                             structure.structureType == STRUCTURE_TOWER)&&
                                                                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)});

    return targets;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // check if s is broken
  checkBroken: function(s){
    return (
      s.hits < s.hitsMax && ( // broken
        // go see Memory.repairConditions
        (Memory.repairConditions[s.structureType].type == "hits" && s.hits < Memory.repairConditions[s.structureType].start)||
        (s.hits < Memory.repairConditions[s.structureType].start*s.hitsMax)
      )
    );
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // check if s is done repairing
  checkRepaired: function(s){
    return (
      s.hits == s.hitsMax || ( // broken
        // go see Memory.repairConditions
        (Memory.repairConditions[s.structureType].type == "hits" && s.hits >= Memory.repairConditions[s.structureType].stop)||
        (s.hits >= Memory.repairConditions[s.structureType].stop*s.hitsMax)
      )
    );
  },


  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // gives you all the broken
  getBroken: function(room){
    var targets = room.find(FIND_STRUCTURES, {filter: this.checkBroken});
    return targets;
  }
};

module.exports = funcStruct;