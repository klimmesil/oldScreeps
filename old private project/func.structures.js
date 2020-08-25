var funcStruct = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // tells the mine power
  minePower: function(id, roomName){
    var source = Game.getObjectById(id);

    if (!source) return null;

    var w = 0;

    // count miner's works
    var miner = Game.creeps[Memory.sources[roomName][id].miner];

    if (!miner) return false;

    var body = miner.body;
    for (var i in body){
      if(body[i].type === WORK) w += 1;
    }

    // count extras
    var extras = Memory.sources[roomName][id].extras;
    if (extras === undefined){
      Memory.sources[roomName][id].extras = {};
    }

    else {
      for (var i in extras){
        var creep = Game.creeps[i];

        if (!creep){
          Memory.sources[roomName][id].extras[i] = undefined;
          break;
        }

        body = creep.body;
        for (var i in body){
          if(body[i].type === WORK) w += 1;
        }
      }
    }

    // return if it is at full potential
    return w;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // tells the haul power
  haulPower: function(roomName){
    // vars
    var room = Game.rooms[roomName];
    var haulers = room.find(FIND_MY_CREEPS, {filter: (c)=>(c.memory.job === "hauler")});
    var h = 0;

    // counting each hauler's power
    for (var i in haulers){
      var hauler = haulers[i];


      for (var j in hauler.body){
        if (hauler.body[j].type === CARRY){
          h += 1;
        }
      }
    }

    return h;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // reduced the theorical amount by x
  reduceAmount: function(struct, x){
    var id = struct.id;
    var type = struct.structureType !== undefined?struct.structureType:"dropped";
    var roomName = struct.room.name;

    // find where it is stored
    var purpose = "";
    switch (type) {
      case "dropped":
        purpose = "dropped";
        break;

      case STRUCTURE_CONTAINER:
        if (Memory.containers[roomName][id].job == "mining"){
          purpose = "miningContainer";
        }
        break;
    }

    // reduce the amount
    var amount = Memory.givers[roomName][purpose][id].amount;
    Memory.givers[roomName][purpose][id].amount = amount - x;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // gives all the givers (resource, mining containers)
  // opt = {minVal: int, order: []}
  getGivers: function(room, opt){
    var minVal = opt.minVal;
    var order = opt.order;
    var givers = [];

    // respect order
    for (var num in order){
      // we get all the targets
      var targets = [];
      for (var j in order[num]){
        var type = order[num][j];

        // array of acceptable givers of type type.
        var acceptable = [];
        for (var id in Memory.givers[room.name][type]){
          if (Memory.givers[room.name][type][id].amount >= minVal){
            acceptable.push(Game.getObjectById(id));
          }
        }
        targets = targets.concat(acceptable);
      }


      // if we have one target, send it!
      if (targets.length > 0) return targets;
    }

    // no targets found
    return [];
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
