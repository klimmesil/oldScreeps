var funcDebug = require("func.debug");

var manageLists = {
  //////////////////////////////////////////////////////////////////////////////
  // reorganize containers
  reorganizeContainers: function(room){
    //for (var i in containers);
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
        if (!Game.creeps[info.miner]) info.miner = null; // reset miner

        // look for an employee
        if (!info.miner){
          var vacantMiners = room.find(FIND_MY_CREEPS, {filter: c => (c.memory.job == "miner" && c.memory.post == null)});

          if (vacantMiners.length > 0){
            var chosen = vacantMiners[0];
            info.miner = chosen.name;
            chosen.memory.post = j;
            chosen.memory.postRoom = i;
          }
        }

        if (!Game.getObjectById(info.container)){
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
              Memory.containers[contObj.id] = {job: "mining", source: j};
              console.log("Container was detected and saved");
            }

          // if the container does not exist
          } else if (!Game.getObjectById(info.container)) {
            delete Memory.containers[info.container]; // delete it from the other list
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
      // reorganize sources (mines for real...)
      this.reorganizeSources(room);

    }
  }
};

module.exports = manageLists;
