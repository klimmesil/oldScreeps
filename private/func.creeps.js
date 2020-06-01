var funcStruct = require("func.structures");

var funcCreeps = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // puts creep to sleep
  sleep: function(creep, debug){
    var job = creep.memory.job;
    var localFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => (flag.name == job)})[0];
    creep.moveTo(localFlag);
    if (debug == 1) creep.say("😴");
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // refills creep within sources (default sources are miningSites)
  refill: function(creep, debug, sources, force){
    // not necessary
    if (force && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) return false;
    else if (!force && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return false;

    // default sources
    if (sources.length == 0){
      for (var id in Memory.miningSites){
        sources.push(Game.getObjectById(id));
      }

      var b = sources;
      sources = sources.filter(container => container.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity());
      if (sources.length == 0) sources = b.filter (container => container.store.getUsedCapacity(RESOURCE_ENERGY) >= 50);
      if (sources.length == 0) return false;
    }

    if (debug == 1){
      creep.say("⚡")
      for (var i in sources){
        var source = sources[i];
        creep.room.visual.text("⚡", source.pos.x, source.pos.y);
      }
    }

    // go refill
    var source = creep.pos.findClosestByRange(sources);
    var outcome = creep.withdraw(source, RESOURCE_ENERGY);
    if (outcome == ERR_NOT_IN_RANGE){
      creep.moveTo(source);
    }
    return true;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // hauls to requesters (default requesters are the extensions and spawns)
  haul: function(creep, debug, requesters, priority){
    // default sources
    if (requesters.length == 0){
      requesters = funcStruct.getRequesters(creep);
    }

    // everything is full
    if (requesters.length == 0){
      return false;
    }

    // priority
    if (priority.length>0){
      for (var i in priority){
        var b = requesters.filter((s)=>(priority[i].includes(s.structureType)));
        if (b.length!=0){
          requesters = b; // if priority objects, focus only on them
          break;
        }
      }
    }

    // go transfer
    var requester = creep.pos.findClosestByRange(requesters);
    if (debug == 1) creep.say("🏎️" + requester.structureType);

    var outcome = creep.transfer(requester, RESOURCE_ENERGY);
    if (outcome == ERR_NOT_IN_RANGE){
      creep.moveTo(requester);
    }
    return true;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // works
  work: function(creep, debug, conditions){
    // look for a task (no task / priority is not yet respected)
    if (!Memory.taskList[creep.memory.task]||(conditions.priority && Memory.taskList[creep.memory.task].work != conditions.work)){
      var job = creep.memory.job;

      // define the filter
      var f = conditions.filter
      if  (!conditions.filter) {
        f = function(){
          return true
        };
      }

      // make a tasklist
      var myTasks = [];
      for (var id in Memory.taskList){
        var task = Memory.taskList[id];

        // filter task (job, number and filter)
        if (task.job == job && task.number > task.workers.length && f(task)) myTasks.push(Game.getObjectById(id));
      }

      var chosenTask = creep.pos.findClosestByRange(myTasks);

      if (chosenTask){
        // delete already existing task if necessary
        if (creep.memory.task){
          for (var i in Memory.taskList.workers){
            var name = Memory.taskList.workers[i];
            if (name == creep.name){
              Memory.taskList.workers.slice(i,1);
            }
          }
        }

        creep.memory.task = chosenTask.id;
        Memory.taskList[chosenTask.id].workers.push(creep.name);
      }
    }

    // if he has one, work
    if (Memory.taskList[creep.memory.task]){
      var task = Memory.taskList[creep.memory.task];
      var structure = Game.getObjectById(creep.memory.task);

      switch (task.work){
        case 'repair':
          if (debug == 1) creep.say("🛠" + structure.structureType);
          if (creep.repair(structure) == ERR_NOT_IN_RANGE) creep.moveTo(structure);
          return true;
          break;

        case 'build':
          if (debug == 1) creep.say("🏗️" + structure.structureType);
          if (creep.build(structure) == ERR_NOT_IN_RANGE) creep.moveTo(structure);
          return true;
          break
      }
    } else return false;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // function that tells cost of body
  bodyCost: function(body){
    var costs = {work: 100, move: 50, carry: 50, attack: 80, ranged_attack: 150, heal: 250, claim: 600, tough:10};
    var sum = 0;
    for (var i in body){
      sum += costs[body[i]];
    }
    return sum;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // go work at his post
  workAtPost: function(creep, debug){
    if (!creep.memory.post){
      return false;
    }

    var id = creep.memory.post;
    var job = creep.memory.job;

    switch(job){
      case "reserver":
        var controller = Game.getObjectById(id);
        var info = Memory.reservedList[id];

        // move to room
        if (!controller){
          var flag = Game.flags[info.roomName];
          creep.moveTo(flag, {visualizePathStyle : {stroke: "#e0f015"}});
        }

        // go work on the controller
        else {
          if (creep.reserveController(controller) == ERR_NOT_IN_RANGE) creep.moveTo(controller, {visualizePathStyle : {stroke: "#e0f015"}});
        }

        break;

      case "miner":
        var container = Game.getObjectById(id);
        var info = Memory.miningSites[id];
        var energy = info.energy;
        var source = Game.getObjectById(info.mining);

        creep.moveTo(container, {visualizePathStyle: {stroke: "#e0f015"}});

        // decide repair or mine
        if (!creep.memory.upping && container.hits < container.hitsMax && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
          creep.memory.upping = true;
          if (debug > 1) console.log("Starting to repair container pos (" + container.pos.x + ", " + container.pos.y + ")");
        } else if (creep.memory.upping && (container.hits == container.hitsMax || creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0)){
          creep.memory.upping = false;
          if (debug > 1 && container.hits == container.hitsMax) console.log("Container repair done pos ("+container.pos.x + ", " + container.pos.y + ")");
        }

        // repair
        if (creep.memory.upping){
          if (debug == 1) creep.say("🛠️");
          creep.repair(container);
        }

        // transfer
        else if (creep.store.getFreeCapacity() == 0){
          if (debug == 1) creep.say("⚡➡️");
          creep.transfer(container, energy);
        }

        // refuel
        else{
          if (debug == 1) creep.say("⚡");
          if (creep.harvest(source) == ERR_NOT_IN_RANGE){
            console.log("Something is wrong with my container pos (" + container.pos.x + ", " + container.pos.y +")");
          }
        }
    }
  }
};

module.exports = funcCreeps;
