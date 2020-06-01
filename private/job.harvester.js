var funcCreeps = require("func.creeps");

var jobHarvester = {
  run : function(creep, debug){
    // say job
    if (debug == 2) creep.say("🌾");
  }
}

module.exports = jobHarvester;
