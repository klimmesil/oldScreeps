var funcCreeps = require("func.creeps");

var jobHauler = {
    /** @param {Creep} creep **/
    run : function(creep, debug){
      // tell job
      if (debug == 2) creep.say("🏎️");
      
      // refill if necessary
      if(funcCreeps.refill(creep, debug, [], false));

      // transfer
      else if(funcCreeps.haul(creep, debug, []));

      // force refill
      else if(funcCreeps.refill(creep, debug, [], true));

      // sleep
      else funcCreeps.sleep(creep,debug);
    }
};

module.exports = jobHauler;
