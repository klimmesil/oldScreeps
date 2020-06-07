var funcCreeps = require("func.creeps");

var jobBuilder = {
  run : function(creep, debug){
    // say job
    if (debug == 2) creep.say("🏗️");

    // refill a little
    if (funcCreeps.refill(creep, debug, {})){
      if (debug == 1) creep.say("⚡");
    }

    // try to repair
    else if (funcCreeps.repair(creep, debug, {})){
      if (debug == 1) creep.say("🛠");
    }

    // try to build
    else if (funcCreeps.build(creep, debug, {}));

    else {
      funcCreeps.sleep(creep, debug, {});
      if (debug == 1) creep.say("😴");
    }
  }
}

module.exports = jobBuilder;
