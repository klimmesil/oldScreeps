var funcStruct = require("func.structures");
var funcCreeps = require("func.creeps");

var jobBuilder = {
    /** @param {Creep} creep **/
    run : function(creep, debug){
      // tell job
      if (debug == 2) creep.say("🏗️");

      // refill if necessary
      if (funcCreeps.refill(creep, debug, [], false));

      // repair
      else if (funcCreeps.work(creep, debug, {filter: (task) => (task.work == 'repair'), priority : true}));

      // build
      else if (funcCreeps.work(creep, debug, {filter: (task) => (task.work == 'build')}));

      // force refill
      else if (funcCreeps.refill(creep, debug, [], true));

      // sleep
      else funcCreeps.sleep(creep,debug);
    }
};

module.exports = jobBuilder;
