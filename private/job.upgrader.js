var funcCreeps = require("func.creeps");

const order = [
  ["controller"],
  ["miningContainer"],
  ["dropped"]
];

var jobUpgrader = {
  run : function(creep, debug){
    // say job
    if (debug == 2) creep.say("⏏️");

    var controller = creep.room.controller;
    var post = controller.id;
    var postRoom = creep.room.name;

    // refill a little
    if (funcCreeps.refill(creep, {order: [...order]}) || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
      if (debug == 1) creep.say("⚡");
    }

    // go to the controller
    else if (funcCreeps.moveToPost(creep, {post: post, postRoom: postRoom, minDist : 3} ) ) {
      if (debug == 1) creep.say("🏍️");
    }

    // try to upgrade the controller
    else if (creep.upgradeController(controller) === 0){
      if (debug === 1) creep.say("⏏️");
    }

    // refill forced
    else if (funcCreeps.refill(creep, {force: true, order: [...order]})){
      if (debug == 1) creep.say("⚡");
    }

    // sleep
    else {
      funcCreeps.sleep(creep, {});
      if (debug == 1) creep.say("😴");
    }
  }
}

module.exports = jobUpgrader;
