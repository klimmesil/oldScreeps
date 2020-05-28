// mananage mining
Memory.miningSites["5ece6c910ad73f6e796fcbeb"] = {energy: RESOURCE_ENERGY, miner: null, mining: "5bbcaf789099fc012e63aa49"};
Memory.miningSites["5ecec9a1db28dd85dcb9acc6"] = {energy: RESOURCE_ENERGY, miner: null, mining: "5bbcaf789099fc012e63aa4a"};

delete Memory.miningSites['5ece6c910ad73f6e796fcbeb'].miner;
delete Memory.miningSites['5ece6c910ad73f6e796fcbeb'].miner;

// manage spawning
Memory.crewList.harvester= {body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], number :0, order: 0};
Memory.crewList.hauler = {body: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], number: 1, order: 1};
Memory.crewList.miner = {body: [MOVE,CARRY,WORK,WORK,WORK,WORK], number: 2, order: 2};
Memory.crewList.upgrader= {body: [CARRY, CARRY, WORK, WORK, WORK, MOVE, MOVE, MOVE], number :2, order: 3};
Memory.crewList.builder= {body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], number :3, order: 4};

// manage crew
Game.spawns["Spawn1"].spawnCreep([MOVE,MOVE,WORK,WORK,CARRY,CARRY],"mob",{memory:{job:"mob"}});
Game.creeps["builder"].memory.job = "builder";
delete Game.creeps["miner18577189"].post;
creep.moveTo(Game.getObjectById("5ecced7e929e2d96f1d302ca"));


// sleeping spot
Memory.sleepingSpot = {x: 17, y:17};


// various
var targets = Game.spawns["Spawn1"].pos.findClosestByRange(FIND_STRUCTURES, {filter: (structure) => (funcStruct.watched(structure))   });
var structure = Game.getObjectById("5ecec9a1db28dd85dcb9acc6");
Memory.miningSites[structure.id] &&
  Memory.miningSites[structure.id].miner &&
  Memory.miningSites[structure.id].resource == RESOURCE_ENERGY
