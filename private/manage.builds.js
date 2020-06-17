var funcDebug = require("func.debug");

var manageBuilds = {
  ///////////////////////////////////////////////////////////////////////////////////
  // give each mine a container
  buildMiningContainers: function(room){
    // for each source
    var sources = Memory.sources[room.name]
    for (var id in sources){
      var source = Game.getObjectById(id);
      var info = sources[id];
      var container = Game.getObjectById(info.container);

      // check if he has a container
      if (container === null && info.container !== "building"){
        // if not, find a place to build one
        var closestSpawn = source.pos.findClosestByRange(FIND_MY_SPAWNS);
        var freeCells = [];
        const blockingStructures = ["spawn", "source", "mineral", "deposit", "controller", "constructedWall", "link", "storage", "tower", "observer", "powerSpawn", "powerBank", "lab", "terminal", "nuker", "factory", "invaderCore"];

        // look at all the surrounding cells
        //x
        for (var x = source.pos.x-1; x <= source.pos.x+1 ; x++){
          //y
          for (var y = source.pos.y-1; y <= source.pos.y+1 ; y++){
            // not the center one
            if (!(x == source.pos.x && y == source.pos.y)){

              // check if there is something that keeps us from building it
              var free = true;
              var looking = room.lookAt(x,y);
              for (var i in looking){
                var type = looking[i].type;
                if (type == "constructionSite" || (type == "structure" && blockingStructures.includes(looking[i].structure.structureType)) || (type == "terrain" && looking[i].terrain == "wall")) {
                  free = false;
                  break;
                }
              }

              if (free) freeCells.push(new RoomPosition(x,y,room.name));
            }
          }
        }

        // now freeCells is full
        var closestCell = closestSpawn.pos.findClosestByRange(freeCells);
        if (closestCell){
          info.container = "building"; // say it's building
          info.containerPos = closestCell // say where it's built
          info.until = Game.time + 5; // say the time the manager will have to delete it if there is a problem
          var test = room.createConstructionSite(closestCell, STRUCTURE_CONTAINER) // build it

          // debug
          room.visual.rect(closestCell.x-0.4,closestCell.y-0.4, 0.8, 0.8, {stroke:"#9b59b6", strokeWidth: 0.2, fill: null});
          room.visual.rect(closestCell.x-0.5,closestCell.y-0.5, 1, 1, {stroke:"#f2ac21", strokeWidth: 0.1, fill: null});
          console.log("Building container for source.", test);
        } else {
          console.log("No room to build container for source. "+id);
        }

      }
    }
  },

  ///////////////////////////////////////////////////////////////////////////////////
  // builds things
  restructure: function(){
    for (var i in Memory.reservedRooms){
      var room = Game.rooms[i];

      // timed ticks
      if (Game.time%5 === 0){
        // build
        this.buildMiningContainers(room);
      }
    }
  }
};

module.exports = manageBuilds;
