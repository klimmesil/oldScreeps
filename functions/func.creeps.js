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
  haul: function(creep, debug, requesters){
    // default sources
    if (requesters.length == 0){
      requesters = funcStruct.getRequesters(creep);
    }

    // everything is full
    if (requesters.length == 0){
      return false;
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
    if (!creep.memory.task||(conditions.priority && Memory.taskList[creep.memory.task].work != conditions.work)){
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
    if (creep.memory.task){
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
  }
};

module.exports = funcCreeps;
