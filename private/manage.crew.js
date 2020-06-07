var manageCrew = {
  failSafe: function(){
    if (Memory.failSafe !== undefined){
      var spawn = Game.spawns[Memory.failSafe.spawnName];
      var trySpawn = spawn.spawnCreep(Memory.failSafe.body, "finalHauler",  {memory: {job: "miner"}});
      console.log("high failSafe hauler incomming " + trySpawn);
      if (trySpawn == 0){
        delete Memory.failSafe;
      }
    }

    // make a failSafe if necessary
    else if (_.size(Game.creeps) == 0){
      // take the best spawn (most energy left)
      var bestSpawn;
      var bestEnergy;
      for (var i in Game.spawns){
        if (!bestSpawn){
          bestSpawn = Game.spawns[i];
          bestEnergy = bestSpawn.room.energyAvailable;
          continue;
        }
        var spawn = Game.spawns[i];
        var energy = spawn.room.energyAvailable;
        if (energy > bestEnergy){
          bestEnergy = energy;
          bestSpawn = spawn;
        }
        break;
      }

      //vars
      var room = bestSpawn.room;

      // no hope
      if (bestEnergy < 100){
        console.log("the end...");
      }

      // just a hauler
      else if (bestEnergy < 200){
        console.log("low failSafe :",room.name,bestSpawn.spawnCreep([MOVE,CARRY], "finalHauler"+Game.time, {memory: {job : "hauler"}}));

      }

      // just a harvester
      else if (bestEnergy < 300){
        console.log("mid failSafe :",room.name,bestSpawn.spawnCreep([MOVE,CARRY,WORK], "finalHarvester"+Game.time, {memory: {job : "harvester"}}));
      }

      // miner and hauler <3
      else {
        // set default bodies and substract cost to total
        var ma = [WORK, MOVE, CARRY];
        var ha = [MOVE, CARRY];
        bestEnergy -= 300;
        var upping = "m";

        // try to upgrade h and m at the same time, h = 1/3 M + 2/3 C  |||| m = 1C + W + (every 3 WORK, 1 MOVE)
        while (bestEnergy>=100){
          // miner
          if (upping == "m"){
            upping = "h";

            // count W and M
            var w, m;
            for (var i in ma){
              if (ma[i] == WORK) w+=1;
              else if (ma[i] == MOVE) m+=1;
            }

            // add m
            if (w/3 >= m){
              bestEnergy -= 50;
              ma.push(MOVE);
            }

            // add w
            else {
              bestEnergy -= 100;
              ma.push(WORK);
            }
          }

          // hauler
          else {
            upping = "m";

            // count W and M
            var c, m;
            for (var i in ha){
              if (ha[i] == CARRY) c+=1;
              else if (ha[i] == MOVE) m+=1;
            }

            // add carry
            if ((c+1)/2 <= m){
              bestEnergy -= 50;
              ma.push(CARRY);
            }

            // add move
            else{
              bestEnergy -= 50;
              ma.push(MOVE);
            }
          }
        }

        // spawn miner and set hauler for later
        console.log("high failSafe spawn/room/body1/body2 :", bestSpawn.name,"/",room.name,"/",ma,"/",ha, bestSpawn.spawnCreep(ma, "finalMiner"+Game.time, {memory: {job : "miner"}}));
        Memory.failSafe = {spawnName: bestSpawn.name, body: ha};
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // manages deaths
  deaths : function(){
    for (var name in Memory.creeps){
      var creep = Game.creeps[name];

      // if he's dead
      if (!creep){
        var announceDeath = "☠️ RIP " + name


        var memory = Memory.creeps[name];
        // if he had a post, delete it
        if (memory.post){
          // delete from mines
          if (memory.job == "miner"){
            Memory.sources[memory.post].miner = null;
            announceDeath += "... Unchecked his mining";
          }

          // builder...
          else if (memory.job == "builder"){
            var post = Game.getObjectById(memory.post);
            if (!post);

            // if he was contructing
            else if (post.progress){
              Memory.constructing[post.room][post.id].workers[name] = undefined;
              announceDeath += "... Unchecked his construction."
            }

            // if he was repairing
            else{
              Memory.broken[post.room][post.id].workers[name] = undefined;
              announceDeath += "... Unchecked his repairs."
            }
          }
        }

        // :'(
        console.log(announceDeath);

        // delete his memory
        delete Memory.creeps[name];
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // manages respawning
  respawn : function(spawn){
    var spawnOrder = Memory.spawnOrder;
    // if we are spawning, announce
    if (spawn.spawning){
      var newName = spawn.spawning.name;
      spawn.room.visual.text(
        "👶 " + Game.creeps[newName].memory.job,
        spawn.pos.x+5,
        spawn.pos.y);
      console.log("Spawning " + newName + " !");

    // else go look into the list
    } else {
      for (var i in spawnOrder){
        // vars
        var jobName = spawnOrder[i].job;
        var alive = 0;

        // count the number already alive
        for (var j in Game.creeps){
          if (Game.creeps[j].memory.job == jobName) alive += 1;
        }
        var number = spawnOrder[i].number;

        // if it's not enough, just pop one out
        if (number > alive){
          var body = spawnOrder[i].body;
          var newName = jobName + Game.time;
          console.log("Spawning " + newName + " !" + spawn.spawnCreep(body, newName, {memory: {job: jobName}}));
          break;
        }
      }
    }
  }
};

module.exports = manageCrew;
