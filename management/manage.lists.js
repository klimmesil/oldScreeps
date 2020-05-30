var funcStruct = require("func.structures");

var manageCrew = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // reorganize miners, and containers
  reorganizeMines : function(room){
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
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // reorganize broken
  reorganizeRepairs: function(room){
    // get all repairs
    var broken = funcStruct.getBroken(room);

    // for each broken structure
    for (var i in broken) {
      var structure = broken[i];
      var id = structure.id;
      
      // if not already done, put it in the taskList
      if (!Memory.taskList[id]){
        Memory.taskList[id] = {
          work: 'repair',
          job: 'builder',
          number: 1,
          until: Memory.repairConditions[structure.structureType].end,
          workers: []
        }
      }
    }
  },

  reorganizeBuilds: function(room) {
    // get all building sites
    var buildingSites = room.find(FIND_MY_CONSTRUCTION_SITES);

    // for each one of them
    for (var i in buildingSites){
      var structure = buildingSites[i];
      var id = structure.id;

      // if not already done, put it in the taskList
      if (!Memory.taskList[id]){
        Memory.taskList[id] = {
          work: 'build',
          job: 'builder',
          number: 2,
          workers: []
        }
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // reorganize tasks
  reorganizeTasks: function(){
    var tasks = Memory.taskList;
    for (var id in tasks){
      var task = tasks[id];
      var object = Game.getObjectById(id);

      var taskDone = function(t,o){
        return(
          (t.work == 'repair'&&(o.hits == o.hitsMax||o.hits >= t.until))|| // repair done
          (t.work == 'build' &&(o.progress == undefined) ) // building done
        );
      };

      // do we need to delete it? (structure destroyed / task done)
      if (!object || taskDone(task, object)) {
        // tell the workers it's done
        for (var i in task.workers){
          delete Game.creeps[task.workers[i]].memory.task;
        }

        delete Memory.taskList[id];
      }

      // check for all workers, if dead or wathever just delete him normally this won't happen thanks to deaths()
      else {
        for (var i in task.workers){
          var name = task.workers[i];
          if (!Game.creeps[name]){
            task.workers.splice(i, 1);
          }
        }
      }
    }
  }
};

module.exports = manageCrew;
