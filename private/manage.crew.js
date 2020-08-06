var funcCreeps = require("func.creeps");
var funcStruct = require("func.structures");

const models = {
  // example:
  // jobName : [Necessary array, bonus array] bonus array will be repeated as many times as possible, going from left to right
  builder: [ [],
  [MOVE,MOVE,CARRY,WORK,WORK,WORK]],

  upgrader: [ [MOVE, CARRY],
  [WORK]],

  hauler: [ [],
  [MOVE, CARRY]],

  miner: [ [MOVE, CARRY],
  [WORK]]
}

const spawnOrder = [
  // tolerance sees how strong you want your creep to be
  // maxed: max it
  // capped: max it, with a cap.
  {job: "miner", need: "number", number: 1, tolerance: "capped", cap: 800},
    {job: "miner", need: "sourceFill", tolerance: "capped", cap: 800},
  {job: "hauler", need: "number", number: 1, tolerance: "maxed"},
  {job: "upgrader", need: "number", number: 1, tolerance: "maxed"},
  {job: "builder", need: "number", number : 1, tolerance: "maxed"}
]

var manageCrew = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // try to save the colony
  failSafe: function(){
    if (Memory.failSafe !== undefined){
      var spawn = Game.spawns[Memory.failSafe.spawnName];
      var trySpawn = spawn.spawnCreep(Memory.failSafe.body, "finalHauler",  {memory: {job: "hauler"}});
      console.log("high failSafe hauler incomming " + trySpawn);
      if (trySpawn == 0){
        Memory.failSafe = "DONE";
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

        // if he had a post, delete it
        if (Memory.creeps[name].post){
          // delete from mines
          if (Memory.creeps[name].job == "miner"){
            Memory.sources[Memory.creeps[name].postRoom][Memory.creeps[name].post].miner = null;
            announceDeath += "... Unchecked his mining";
          }

          // builder...
          else if (Memory.creeps[name].job == "builder"){
            var post = Game.getObjectById(Memory.creeps[name].post);
            if (!post);

            // if he was contructing
            else if (post.progress){
              Memory.constructing[Memory.creeps[name].postRoom][post.id].workers[name] = undefined;
              announceDeath += "... Unchecked his construction."
            }

            // if he was repairing
            else{
              Memory.broken[Memory.creeps[name].postRoom][post.id].workers[name] = undefined;
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
  // manages bodyStrength
  makeBody: function(model, energy) {
    // see body const to see which model is used
    var remainingEnergy = energy;
    var info = models[model];

    // we make the initial body
    var body = [...info[0]]; // initial body, necessary parts
    var initialCost = funcCreeps.bodyCost(body);
    remainingEnergy -= initialCost;
    if (remainingEnergy < 0) return []; // the body is too expensive

    // we add the bonus parts
    var bonus = [...info[1]]; // bonus parts if possible.
    var bonusCost = funcCreeps.bodyCost(bonus);
    var num = Math.floor(remainingEnergy / bonusCost);

    // we add whole bonus parts
    for (var i = 1; i <= num; i++){
      body = body.concat(bonus);
    }

    remainingEnergy -= num * bonusCost;


    // we fill with the rest if possible
    var k = 0;
    var modulo = bonus.length;
    while (true){
      var addedPart = bonus[k];
      var addedCost = BODYPART_COST[addedPart];

      // we can add the part
      if (remainingEnergy >= addedCost){
        remainingEnergy -= addedCost;
        body.push(addedPart);
      }

      // the part is too expensive
      else {
        break;
      }

      k = (k+1)%modulo;
    }

    return body;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // gets living creeps (with job and remaining ticks to live)
  getLiving: function(job, ticks){
    var ret = [];

    // look all of the creeps
    for (var i in Game.creeps){
      var creep = Game.creeps[i];

      if (creep.ticksToLive >= ticks && creep.memory.job == job){
        ret.push(creep);
      }
    }

    return ret;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // sees if there is a source that isn't working at full speed
  potentialSource: function(room){
    for (var i in Memory.sources[room.name]){
      if (!funcStruct.fullPotential(i, room.name)) return true;
    }

    return false;
  },


  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // manages respawning
  respawn : function(spawn){
    // don't try to f things up
    if (Memory.failSafe !== undefined){
      if (Memory.failSafe === "DONE") delete Memory.failSafe;
      return false;
    }

    // if we are spawning, announce
    if (spawn.spawning){
      var newName = spawn.spawning.name;
      spawn.room.visual.text(
        "👶 " + Game.creeps[newName].memory.job,
        spawn.pos.x+5,
        spawn.pos.y);
      console.log("Spawning " + newName + " !");
      return true;
    }



    // else go look for something to spawn
    for (var i in spawnOrder){
      var job = spawnOrder[i].job

      // we want a specific number of these living
      if (spawnOrder[i].need === "number"){
        var living = this.getLiving(job, 100); // all the creeps with the job and 100+ ticks to live

        if (spawnOrder[i].number > living.length){
          // see how much energy we need
          var energy = 0;
          if (spawnOrder[i].tolerance === "capped"){
            energy = Math.min(spawn.room.energyCapacityAvailable, spawnOrder[i].cap);
          }

          else if (spawnOrder[i].tolerance === "maxed") {
            energy = spawn.room.energyCapacityAvailable;
          }

          // make the body
          var body = this.makeBody(job, energy);

          // name and spawn him
          var newName = job + Game.time;
          console.log("Started spawning " + newName + " !" + spawn.spawnCreep(body, newName, {memory: {job: job}}));
          break;
        }

      }

      // we want them to occupy the sources as much as possible (see miners)
      else if (spawnOrder[i].need === "sourceFill" && this.potentialSource(spawn.room)){
        // see how much energy we need
        var energy = 0;
        if (spawnOrder[i].tolerance === "capped"){
          energy = Math.min(spawn.room.energyCapacityAvailable, spawnOrder[i].cap);
        }

        else if (spawnOrder[i].tolerance === "maxed") {
          energy = spawn.room.energyCapacityAvailable;
        }

        // make the body
        var body = this.makeBody(job, energy);

        // name and spawn him
        var newName = job + Game.time;
        console.log("Started spawning " + newName + " !" + spawn.spawnCreep(body, newName, {memory: {job: job}}));
        break;
      }

    }
  }
};

module.exports = manageCrew;
