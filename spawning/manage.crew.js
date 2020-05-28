var manageCrew = {
  /** @param **/
  deaths : function(){
    for (var name in Memory.creeps){
      if (!Game.creeps[name]){
        delete Memory.creeps[name];
        console.log("☠️ RIP " + name);
      }
    }
  },

  /** @param **/
  respawn : function(spawn){
    var jobNames = Memory.crewList;
    if (spawn.spawning){
      var newName = spawn.spawning.name;
      spawn.room.visual.text(
        "👶 " + Game.creeps[newName].memory.job,
        spawn.pos.x+5,
        spawn.pos.y);
        console.log("Spawning " + newName + " !");
    } else {
      var order = [];
      for (var jobName in jobNames){
        order[(jobNames[jobName].order)] = jobName;
      }
      for (var i in order){
        var jobName = order[i];

        var alive = spawn.room.find(FIND_MY_CREEPS, {filter: (creep) => (creep.memory.job == jobName)});
        var number = jobNames[jobName].number;

        if (number > alive.length){
          var body = jobNames[jobName].body;
          var newName = jobName + Game.time;
          console.log("Spawning " + newName + " !" + spawn.spawnCreep(body, newName, {memory: {job: jobName}}));
          break;
        }
      }
    }
  },

  /** @param **/
  reorganize : function(room){
    for (var id in Memory.miningSites){
      var container = Game.getObjectById(id);
      var info = Memory.miningSites[id];
      // one container has no miner or miner is dead
      if (!Game.creeps[info.miner]){
        var vacantMiners = room.find(FIND_MY_CREEPS, {filter: (creep) => (creep.memory.job == "miner" && !creep.memory.post)});

        // there are no miners left
        if (vacantMiners.length == 0){
          console.log("Container is missing a miner. pos (" + container.pos.x + ", " + container.pos.y+ ")");
          info.miner = null;
        }

        // there is a miner
        else {
          vacantMiners[0].memory.post = id;
          info.miner = vacantMiners[0].name;
          console.log("Vacant miner " + info.miner + " is now working at container pos (" + container.pos.x + ", " + container.pos.y + ")");
        }
      }

    }

  }
};

module.exports = manageCrew;