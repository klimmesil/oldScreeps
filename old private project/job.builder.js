var funcCreeps = require("func.creeps");

const order = [
  ["miningContainer"],
  ["dropped"]
];

var jobBuilder = {
  run : function(creep, debug){
    // say job
    if (debug == 2) creep.say("🏗️");

    // refill a little
    if (funcCreeps.refill(creep, {order: [...order]}) || creep.store.getUsedCapacity() === 0){
      if (debug == 1) creep.say("⚡");
    }

    // try to repair
    else if (funcCreeps.repair(creep, {})){
      if (debug == 1) creep.say("🛠");
    }

    // try to build
    else if (funcCreeps.build(creep, {})){
      if (debug == 1) creep.say("🏗️");
    }

    // refill forced
    else if (funcCreeps.refill(creep, {force: true, order: [...order]})){
      if (debug == 1) creep.say("⚡");
    }

    // sleep
    else {
      funcCreeps.sleep(creep, {});
      if (debug == 1) creep.say("😴");
    }
  }
}

module.exports = jobBuilder;
