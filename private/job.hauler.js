var funcCreeps = require("func.creeps");

var jobHauler = {
  run : function(creep, debug){
    // say job
    if (debug == 2) creep.say("🏎️");

    // go refill no force
    if (funcCreeps.refill(creep, debug, {})){
      if (debug == 1) creep.say("⚡");
    }

    // go transfer
    else if (funcCreeps.haul(creep, debug, {priorities: [[STRUCTURE_SPAWN, STRUCTURE_EXTENSION], [STRUCTURE_TOWER], [STRUCTURE_STORAGE]]})){
      if (debug == 1) creep.say("⚡➡️");
    }

    // go refill, force
    else if (funcCreeps.refill(creep, debug, {force:true})){
      if (debug == 1) creep.say("⚡");
    }

    // go sleep
    else{
      funcCreeps.sleep(creep, debug)
      if (debug == 1) creep.say("😴");
    }
  }
}

module.exports = jobHauler;
