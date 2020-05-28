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
        var container = Game.getObjectById(id);
        var info = Memory.miningSites[id];

        // he makes sure he is on the container
        if (creep.pos.x != container.pos.x || creep.pos.y != container.pos.y){
          creep.moveTo(container, {visualizePathStyle: {stroke: "#e0f015"}});
          if (debug>0) console.log("Miner moving to pos (" + container.pos.x + ", " + container.pos.y + ")");
        }

        // then he just mines and stores continuously... if necessery he'll repair his container too.
        else {
          var energy = info.energy;
          var source = Game.getObjectById(info.mining);

          // decide wether to repair or work
          if (!creep.memory.upping && container.hits < container.hitsMax && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
            creep.memory.upping = true;
            if (debug > 1) console.log("Starting to repair container pos (" + container.pos.x + ", " + container.pos.y + ")");
          } else if (creep.memory.upping && (container.hits == container.hitsMax || creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0)){
            creep.memory.upping = false;
            if (debug > 1 && container.hits == container.hitsMax) console.log("Container repair done pos ("+container.pos.x + ", " + container.pos.y + ")");
          }

          // repair
          if (creep.memory.upping){
            if (debug == 1) creep.say("🛠️");
            creep.repair(container);
          }

          // transfer
          else if (creep.store.getFreeCapacity() == 0){
            if (debug == 1) creep.say("⚡➡️");
            creep.transfer(container, energy);
          }

          // refuel
          else{
            if (debug == 1) creep.say("⚡");
            if (creep.harvest(source) == ERR_NOT_IN_RANGE){
              console.log("Something is wrong with my container pos (" + container.pos.x + ", " + container.pos.y +")");
            }
          }
        }

      }
    }
};

module.exports = jobMiner;
