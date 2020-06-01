var jobMiner = {
    /** @param {Creep} creep **/
    run : function(creep, debug){
      // tell job
      if (debug == 2) creep.say("⛏️");

      // if he has no post
      if (!creep.memory.post){
        if (debug == 1) creep.say("🥱");
      }

      // else he goes to work
      else {
        var id = creep.memory.post;
        var info = Memory.miningSites[id];
        var post = Game.getObjectById(id);
        var target = Game.getObjectById(info.mining);
        var energy = info.energy;

        // move to post
        if (creep.moveTo(post)==0 || creep.moveTo(Game.flags[info.roomName]) == 0);

        // repair structure
        else if (creep.repair(post) == 0) creep.say("🛠"");

        // mine
        else if (creep.harvest(target)) if (debug == 1) creep.say("⛏️");

        // transfer
        else if (creep.transfer(post, energy)) creep.say("⚡");
      }
    }
};

module.exports = jobMiner;
