var funcCreeps = require("func.creeps");

var jobMiner = {
  run : function(creep, debug){
    // say job
    if (debug == 2) creep.say("⛏️");

    var postRoom = creep.memory.postRoom;
    var post = undefined;
    if (postRoom && creep.memory.post) post = Memory.sources[postRoom][creep.memory.post].container;

    // if you have a post, go to post
    if (funcCreeps.moveToPost(creep, {post: post, debug: debug})){
      if (debug == 1) creep.say("🏍️");
    }

    // if you can mine, just DO IT
    else if (funcCreeps.mine(creep, {source:post?Game.getObjectById(creep.memory.post):creep.pos.findClosestByRange(FIND_SOURCES)})){
      if (debug == 1) creep.say("⛏️");
    }
  }
};

module.exports = jobMiner;
