var funcStruct = require("func.structures");
var funcDebug = require("func.debug");

var funcCreeps = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // puts creep to sleep
  sleep: function(creep, debug){
    var job = creep.memory.job;
    var localFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => (flag.name == job)})[0];
    creep.moveTo(localFlag, {visualizePathStyle: {}});
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // refills creep within sources (default sources are miningSites)
  // opt = {force: bool, sources: Array, type: res, minVal: int}
  refill: function(creep, debug, opt){
    // see if it is needed
    var force = opt.force;
    var type = (opt.type ? opt.type : RESOURCE_ENERGY);
    if (!force && creep.store.getUsedCapacity(type) > 0) return false;
    if (force && creep.store.getFreeCapacity() == 0) return false;

    // vars
    var minVal = opt.minVal!==undefined?opt.minVal: (force?50:creep.store.getCapacity());
    var givers = opt.sources!==undefined?opt.sources: (funcStruct.getGivers(creep.room, {type: type, minVal: minVal}));

    // go refill
    var target = creep.pos.findClosestByRange(givers);

    if (!target) return false;

    if (creep.pos.getRangeTo(target) > 1) creep.moveTo(target, {visualizePathStyle: {}});
    else if (target.structureType === undefined) creep.pickup(target);
    else creep.withdraw(target, type);

    return true;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // hauls to requesters (default requesters are the extensions and spawns)
  // opt = {requesters: Array, type: res, priorities: Array}
  haul: function(creep, debug, opt){
    // see if we have what it takes
    if (creep.store.getUsedCapacity() == 0) return false;

    // vars
    var type = opt.type?opt.type:RESOURCE_ENERGY;
    var requesters = opt.requesters!==undefined?opt.requesters:funcStruct.getRequesters(creep.room,{});
    var priorities = opt.priorities!==undefined?opt.priorities:[];
    var targets = requesters;

    // see if there is at least one target
    if (targets.length == 0) return false;

    // ! priorities is an array arrays of structureTypes
    if (priorities.length > 0){
      for (var i in priorities){
        targets = requesters.filter(x => priorities[i].includes(x.structureType));
        if (targets.length > 0) break;
      }
    }
    if (targets.length == 0) targets = requesters;

    // go transfer
    var target = creep.pos.findClosestByRange(targets);
    if (creep.pos.getRangeTo(target) > 1) creep.moveTo(target, {visualizePathStyle: {}});
    else creep.transfer(target, type);

    return true;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // mines. Only possible if source is visible!
  // opt = {source: sourceObj (by default, it's the miner's source)}
  mine: function(creep, debug, opt){
    // default vars
    var source = opt.source !== undefined?opt.source:(Game.getObjectById(creep.memory.post));
    var dist = creep.pos.getRangeTo(source);

    // mine
    if (dist > 1) creep.moveTo(source, {visualizePathStyle: {}}); // get closer
    else creep.harvest(source); // harvest

    return true

  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // goes to your post.
  // opt = {post: id, postRoom: roomName} if you want to cheat your way
  moveToPost: function(creep, debug, opt){
    var post = opt.post?opt.post:creep.memory.post;
    var postRoom = opt.postRoom?opt.postRoom:creep.memory.postRoom;

    if (!post || !postRoom) return false;

    // check if we are in the same room
    if (postRoom != creep.room.name){
      if (debug == 1) creep.say("🏍️");
      // move to flag
      var flag = Game.flags[postRoom];
      if (!flag){
        console.log("I,", creep.name, "can't find a flag to my post.");
        return true;
      }
      creep.moveTo(flag, {visualizePathStyle: {}});
      return true;
    }

    // check if we are already at post
    var postObj = Game.getObjectById(post);
    var dist = creep.pos.getRangeTo(postObj);
    if (dist > 0){
      console.log("we are travelling, same room",dist, postObj.pos.x,postObj.pos.y);
      if (debug == 1) creep.say("🏍️");
      creep.moveTo(postObj, {visualizePathStyle: {}});
      return true;
    }
    return false;

  },


  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // function that tells cost of body
  bodyCost: function(body){
    var sum = 0;
    for (var i in body){
      sum += BODYPART_COST[body[i]];
    }
    return sum;
  }
};

module.exports = funcCreeps;
