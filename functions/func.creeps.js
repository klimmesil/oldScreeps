var funcCreeps = {
  sleep: function(creep, debug){
    var job = creep.memory.job;
    var localFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => (flag.name == job)})[0];
    creep.moveTo(localFlag);
    if (debug == 1) creep.say("😴");
  }
};

module.exports = funcCreeps;
