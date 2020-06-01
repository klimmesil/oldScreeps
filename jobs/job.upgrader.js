var funcCreeps = require("func.creeps");

var jobUpgrader = {
  /** @param {Creep} creep **/
  run : function(creep, debug){
    // tell job
    if (debug == 2) creep.say("⏫");

    var storage = creep.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_STORAGE)})[0];

    // refill if necessary
    if (funcCreeps.refill(creep, debug, [storage], false));

    else {
      // work
      if (debug == 1) creep.say("⏫");
      var controller = creep.room.controller;
      if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE){
        creep.moveTo(controller, {visualizePathStyle : {stroke : "#1232f3"}});
      }

      // force refill
      else if (funcCreeps.refill(creep, debug, [storage], true));

      // sleep
      else funcCreeps.sleep(creep, debug);
    }
  }
};

module.exports = jobUpgrader;
