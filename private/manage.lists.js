var funcDebug = require("func.debug");
var funcStruct = require("func.structures");

var manageLists = {
  //////////////////////////////////////////////////////////////////////////////
  // add requesters
  addRequesters: function(room){

  },

  //////////////////////////////////////////////////////////////////////////////
  // add givers
  addGivers: function(room){
    var roomName = room.name;

    // initialize room
    if (Memory.givers[roomName] === undefined) Memory.givers[roomName] = {dropped: {}, miningContainers: {}};

    // all the dropped resources
    var drops = room.find(FIND_DROPPED_RESOURCES, {filter: (r => r.resourceType == RESOURCE_ENERGY)});
    for (var i in drops){
      var drop = drops[i];
      var id = drop.id;

      // if this drop isn't registered yet, get it
      if (Memory.givers[roomName].dropped[id] === undefined && drop.resourceType === RESOURCE_ENERGY){
        Memory.givers[roomName].dropped[id] = {amount: drop.amount};
      }
    }

    // all the containers
    for (var id in Memory.containers[roomName]){
      var purpose = Memory.containers[roomName][id].job;
      var container = Game.getObjectById(id);

      // see what it's meant for
      switch (purpose) {
        case "mining":
          // if this mine is not registered yet, get it
          if (Memory.givers[roomName].miningContainers[id] === undefined){
            Memory.givers[roomName].miningContainers[id] = {amount: container.store!==undefined?container.store.getUsedCapacity(RESOURCE_ENERGY):0};
          }
          break;

        case "upgrading":
          // if this upgrader is not registered yet, get it
          if (Memory.givers[roomName].upgradingContainer[id] === undefined){
            Memory.givers[roomName].upgradingContainer[id] = {amount: container.store.getUsedCapacity(RESOURCE_ENERGY)};
          }
          break;
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////
  // reorganize requesters
  reorganizeRequesters: function(room){
    var roomName = room.name;

    if (Memory.requesters[roomName] === undefined) Memory.requesters[roomName] = {};
  },

  //////////////////////////////////////////////////////////////////////////////
  // reorganize givers
  reorganizeGivers: function(room){
    var roomName = room.name;

    if (Memory.givers[roomName] === undefined) Memory.givers[roomName] = {dropped: {}, miningContainers: {}};

    // check the ones we have
    for (var type in Memory.givers[roomName]){
      for (var id in Memory.givers[roomName][type]){
        var obj = Game.getObjectById(id);

        // not a giver anymore
        if (!obj){
          delete Memory.givers[roomName][type][id]; // delete it
        }

        // else, resets its actual enegy (creeps will later change that this tick)
        else {
          Memory.givers[roomName][type][id].amount = obj.store!==undefined?obj.store.getUsedCapacity():(obj.amount!==undefined?obj.amount:0);
        }
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////
  // reorganize broken
  reorganizeBroken: function(room){
    var broken = funcStruct.getBroken(room);

    if (!Memory.broken[room.name]) Memory.broken[room.name] = {};

    // check and delete old ones
    for (var id in Memory.broken[room.name]){
      var obj = Game.getObjectById(id);
      if (!obj || funcStruct.checkRepaired(obj)){
        // delete all posts
        for (var i in Memory.broken[room.name][id].workers){
          if (Game.creeps[i]){
            Game.creeps[i].memory.post = null;
            Game.creeps[i].memory.postRoom = null;
          }
        }

        // delete task
        delete Memory.borken[room.name][id];
      }
    }

    // if a worker stops working, he will uncheck his box alone

    // add new ones
    for (var i in broken){
      var id = broken[i].id;

      if (!Memory.broken[room.name][id]){
        Memory.broken[room.name][id] = {number: 1, workers: {}};
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////
  // reorganize constructions
  reorganizeConstructions: function(room){
    var constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);

    if (!Memory.constructing[room.name]) Memory.constructing[room.name] = {};

    // check for old ones done
    for (var id in Memory.constructing[room.name]){
      var site = Game.getObjectById(id);

      // the site is dead, or done
      if (!site || !site.progress){

        // delete posts
        for (var name in Memory.constructing[room.name][id].workers){
          if (Game.creeps[i]){
            Game.creeps[i].memory.post = null;
            Game.creeps[i].memory.postRoom = null;
          }
        }

        // delete from list
        delete Memory.constructing[room.name][id];
      }


      else{
        // check if one of the creeps is dead
        for (var i in Memory.constructing[room.name][id].workers){
          var creep = Game.creeps[i];

          if (!creep || creep.memory.post !== id){
            delete Memory.constructing[room.name][id].workers[i];
          }
        }
      }

    }

    // add new ones
    for (var i in constructionSites){
      var id = constructionSites[i].id;

      if (!Memory.constructing[room.name][id]){
        Memory.constructing[room.name][id] = {number: 2, workers: {}};
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////
  // reorganize sources
  reorganizeSources: function(room){
    if (!room) return false;
    var i = room.name

    // see if we have a list of sources
    if (!Memory.sources[i]){
      Memory.sources[i] = {}; // make it
      var roomSources = room.find(FIND_SOURCES);

      // put all sources in it
      for (var j in roomSources){
        var source = roomSources[j];
        Memory.sources[i][source.id] = {miner: null, container: null, type: RESOURCE_ENERGY};
      }
    } else {
      // just a quick check for each source
      for (var j in Memory.sources[i]){
        var info = Memory.sources[i][j];
        // miner will automaticly uncheck if necessary

        // look for an employee
        if (!info.miner){
          var vacantMiners = room.find(FIND_MY_CREEPS, {filter: c => (c.memory.job == "miner" && c.memory.post == null)});

          if (vacantMiners.length > 0){
            var chosen = vacantMiners[0];
            info.miner = chosen.name;
            chosen.memory.post = j;
            chosen.memory.postRoom = i;
            console.log("Miner", chosen.name,"now works at source.");
          }
        }

        if (!Game.getObjectById(info.container)){
          if (Memory.containers[i] === undefined) Memory.containers[i] = {};

          // if the container is still building
          if (info.container === "building"){
            // bug safe
            if (!info.containerPos || !info.until || Game.time > info.until){
              info.containerPos = undefined;
              info.until = undefined;
              info.container = null;
              console.log("Container was not detected in time.");
              continue;
            }

            // check if the container is there
            var contObj = room.lookForAt(LOOK_CONSTRUCTION_SITES,info.containerPos.x, info.containerPos.y)[0];
            if (_.get(contObj, 'structureType') === STRUCTURE_CONTAINER) {
              info.container = contObj.id;
              Memory.containers[i][contObj.id] = {job: "mining", source: j};
              console.log("Container was detected and saved");
            }

          // if the container does not exist
          } else if (!Game.getObjectById(info.container)) {
            delete Memory.containers[i][info.container]; // delete it from the other list
            info.container = null; // reset container
            console.log("Source is missing a container.");
          }
        }
      }
    }

    return true;
  },

  //////////////////////////////////////////////////////////////////////////////
  // initialize all memory
  initialize: function(){
    if (!Memory.initialized){
      // will stock sources and info about them
      Memory.sources = {};

      // will stock containers and info about them
      Memory.containers = {};

      // will see which things need repairs
      Memory.broken = {};

      // will see all the constructions
      Memory.constructing = {};

      // will see all requesters
      Memory.givers = {};

      // will see all givers
      Memory.requesters = {};

      // will keep track of how much creeps we wanna have
      Memory.spawnOrder = [
        {body: [MOVE, CARRY, WORK], job: "harvester", number: 0},
        {body: [MOVE, CARRY], job: "hauler", number: 1},
        {body: [MOVE, CARRY, WORK], job: "miner", number: 1},
        {body: [MOVE, CARRY, WORK], job: "upgrader", number: 1},
        {body: [MOVE, CARRY, WORK], job: "builder", number: 1}
      ];

      // will stock rooms that we would like to reserve later on and info about them
      Memory.reservedRooms = {};
      for (var name in Game.spawns){
        var spawn = Game.spawns[name];
        Memory.reservedRooms[spawn.room.name] = {controlled: true};
      }

      Memory.initialized = true;

    }
  },

  //////////////////////////////////////////////////////////////////////////////
  // reorganize all lists
  reorganize: function(){
    //initialize
    this.initialize();

    for (var i in Memory.reservedRooms){
      var room = Game.rooms[i];

      // timed ticks
      switch (Game.time%5) {
        case 0:
          this.addGivers(room);
          break;

        case 1:
          this.addRequesters(room);
          break;
      }

      // reorganize givers
      this.reorganizeGivers(room);

      // reorganize requesters
      this.reorganizeRequesters(room);

      // reorganize broken things
      this.reorganizeBroken(room);

      // reorganizeConstructions;
      this.reorganizeConstructions(room);

      // reorganize sources (mines for real...)
      this.reorganizeSources(room);
    }
  }
};

module.exports = manageLists;
