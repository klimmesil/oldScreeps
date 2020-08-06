var funcCreeps = require("func.creeps");

var jobMiner = {
  run : function(creep, debug){
    // say job
    if (debug == 2) creep.say("⛏️");

    // get a post
    if (!creep.memory.post) funcCreeps.getMiningPost(creep, {});

    var minDist = 0;
    var postRoom = creep.memory.postRoom;
    var post = undefined;
    if (postRoom && creep.memory.post) post = Memory.sources[postRoom][creep.memory.post].container;
    else if (postRoom && creep.memory.helping) {
      post = creep.memory.helping;
      minDist = 1;
    }

    // if you have a post, go to post
    if (funcCreeps.moveToPost(creep, {post: post, postRoom: postRoom, minDist: 1})){
      if (debug == 1) creep.say("🏍️");
    }

    // if you can mine, just DO IT
    else if (funcCreeps.mine(creep, {})){
      if (debug == 1) creep.say("⛏️");
    }

    // else just sleep
    else {
      if (debug === 1) creep.say("🥱");
    }
  }
};

module.exports = jobMiner;
