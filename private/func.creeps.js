var funcStruct = require("func.structures");
var funcDebug = require("func.debug");

var funcCreeps = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // puts creep to sleep
  sleep: function(creep){
    var job = creep.memory.job;
    var localFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => (flag.name == job)})[0];
    creep.moveTo(localFlag, {visualizePathStyle: {}});
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // refills creep within sources (default sources are miningSites)
  // opt = {force: bool, sources: Array, minVal: int, order: [[types], [types]]}
  refill: function(creep, opt){
    // see if it is needed
    var force = opt.force;
    if (!force && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) return false;
    if (force && creep.store.getFreeCapacity() == 0) return false;

    // vars
    var minVal = opt.minVal!==undefined?opt.minVal: (force?50:creep.store.getCapacity());
    var order = opt.order!==undefined?opt.order: [["dropped"], ["miningContainers"]];
    var givers = opt.sources!==undefined?opt.sources: (funcStruct.getGivers(creep.room, {order: order, minVal: minVal}));

    var target = creep.pos.findClosestByRange(givers);
    if (!target) return false;

    // say we are going to take some
    funcStruct.reduceAmount(target, creep.store.getFreeCapacity());

    // go refill
    if (creep.pos.getRangeTo(target) > 1) creep.moveTo(target, {visualizePathStyle: {}});
    else if (target.structureType === undefined) creep.pickup(target);
    else creep.withdraw(target, type);

    return true;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // hauls to requesters (default requesters are the extensions and spawns)
  // opt = {requesters: Array, type: res, priorities: Array}
  haul: function(creep, opt){
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
  mine: function(creep, opt){
    // default vars
    var source = opt.source !== undefined?opt.source:(Game.getObjectById(creep.memory.post));
    var dist = creep.pos.getRangeTo(source);

    // mine
    if (dist > 1) creep.moveTo(source, {visualizePathStyle: {}}); // get closer
    else creep.harvest(source); // harvest

    return true

  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Finds a building post
  // opt = {force: bool}
  findBuildingPost: function(creep, opt){
    // vars
    var roomName = creep.room.name;
    var forced = opt.forced == true; // that way I force this to be a bool


    // we want to return the task that has less people/ a task that lacks workers
    if (forced){
      var bestPost = null;
      var minWorkers = 999;

      // for each job
      for (var id in Memory.constructing[roomName]){
        var workers = Object.keys(Memory.constructing[roomName][id].workers).length;
        var needed = Memory.constructing[roomName][id].number;

        // if lacking, take it
        if (workers < needed){
          return {id: id, room: roomName};
        }

        // else, take the minimum
        else if (workers < minWorkers){
          minWorkers = workers;
          bestPost = id;
        }
      }

      return {id: bestPost, room: roomName};
    }

    // we want to return a task that lack workers
    else {
      // for each job
      for (var id in Memory.constructing[roomName]){
          var workers = Object.keys(Memory.constructing[roomName][id].workers).length;
          var needed = Memory.constructing[roomName][id].number;

          // if it lacks, take it
          if (workers < needed){
            return {id: id, room: roomName};
          }
      }

      // there was no job
      return {id: null, room: roomName};
    }

  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // goes to your post.
  // opt = {post: id, postRoom: roomName debug: just the debug info, minDist: distance needed to target} if you want to cheat your way
  moveToPost: function(creep, opt){
    var post = opt.post?opt.post:creep.memory.post;
    var postRoom = opt.postRoom?opt.postRoom:creep.memory.postRoom;
    var debug = opt.debug;
    var minDist = opt.minDist === undefined?0:opt.minDist;

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
    if (dist > minDist){
      if (debug == 1) creep.say("🏍️");
      creep.moveTo(postObj, {visualizePathStyle: {}});
      return true;
    }
    return false;

  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // repairs
  // opt = {force: bool (= false)}
  repair: function(creep, opt){
    var postID = creep.memory.post;
    var post = Game.getObjectById(postID);

    // failSafe: repair job, not forced and requirements
    if (post && !post.progress && !forced && Object.keys(Memory.broken[creep.room.name][postID].workers).length > Memory.broken[creep.room.name][postID].number){
      Memory.broken[creep.room.name][postID].workers[creep.name] = undefined; // delete from list
      creep.memory.post = undefined; // delete from memory
    }

    // no job
    if (!post || post.progress){
      // vars
      var forced = opt.forced;
      var n = 1;
      var complete = true;
      var done = false;

      // no job look for a task
      do {
        complete = true
        for (var id in Memory.broken[creep.room.name]){
          var obj = Game.getObjectById(id);
          var number = Memory.broken[creep.room.name][id].number;
          var workers = Memory.broken[creep.room.name][id].workers;
          var workerCount = Object.keys(workers).length;

          if (n < number) complete = false;

          // just take the job whatever.
          if (forced && n > workerCount){
            creep.memory.post = id;
            creep.memory.postRoom = obj.room.name;
            Memory.broken[creep.room.name][id].workers[creep.name] = true;
            done = true;
          }

          // take the job if if if if...
          else if (!forced && n > workerCount && n <= number){
            creep.memory.post = id;
            creep.memory.postRoom = obj.room.name;
            Memory.broken[creep.room.name][id].workers[creep.name] = true;
            done = true;
          }
        }

        n+=1;

      } while (Object.keys(Memory.broken[creep.room.name]).length > 0 && (!done && (!foced && complete) ) ); // done if everything is repaired found a job OR all jobs meet creep requirements (and not forced)

      post = Game.getObjectById(creep.memory.post);
    }


    if (!post || post.progress) return false; // no job found


    // else, job and work!
    var dist = creep.pos.getRangeTo(post);
    if (dist > 3) creep.moveTo(post, {visualizePathStyle: {}});
    else creep.repair(post);

    return true

  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // builds things
  // opt = {force: bool}
  build: function(creep, opt){
    var postId = creep.memory.post;
    var roomName = creep.memory.postRoom;
    var post = Game.getObjectById(postId);
    var forced = opt.forced == true;

    // if there is no roomName, be sure there is no post
    if (roomName === undefined) post = null;

    // if you have a job, aren't needed and there is a job that needs you, go for that one first.
    if (post && post.progress && !forced && Memory.constructing[roomName][postId].number < Object.keys(Memory.constructing[roomName][postId].workers).length){
      var search = this.findBuildingPost(creep, {forced: false});
      var newPost = search.id;
      var newRoom = search.room;

      // abandon old job
      if (newPost){
        Memory.constructing[roomName][postId].workers[creep.name] = undefined;
        creep.memory.post = newPost;
        creep.memory.postRoom = newRoom;
      }

      // alright, hold on to that job, but don't do it yet
      else {
        return false;
      }
    }


    // if you have no valid job
    else if (!post || !post.progress){
      var search = this.findBuildingPost(creep, {forced: false});
      var newPost = search.id;
      var newRoom = search.room;

      // set my job
      if (newPost){
        creep.memory.post = newPost;
        creep.memory.postRoom = newRoom;
      }

      // no job
      else {
        return false;
      }
    }

    // work
    var moving = this.moveToPost(creep, {post: creep.memory.post, postRoom: creep.memory.postRoom, debug: opt.debug, minDist: 3});

    if (!moving) creep.build(Game.getObjectById(creep.memory.post));
    return true;

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
