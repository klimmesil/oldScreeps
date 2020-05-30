var manageLists = require('manage.lists');

var manageCrew = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // manages deaths
  deaths : function(){
    for (var name in Memory.creeps){
      var creep = Game.creeps[name];

      // if he's dead
      if (!creep){
        // :'(
        console.log("☠️ RIP " + name);

        // cancel his task
        var taskID = Memory.creeps[name].task;
        var task = Memory.taskList[taskID];
        if (task){
          for (var i in task.workers){
            if (task.workers[i] == name){
              console.log("cancelled his task");
              task.workers.slice(i,1);
              break;
            }
          }
        }

        // delete his memory
        delete Memory.creeps[name];
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // manages respawning
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // reorganize everything
  reorganize : function(room){
    // mines
    manageLists.reorganizeMines(room);

    // repairs
    manageLists.reorganizeRepairs(room);

    // builds
    manageLists.reorganizeBuilds(room);

    // taskListUpdate
    manageLists.reorganizeTasks(room);
  }
};

module.exports = manageCrew;
