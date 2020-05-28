var funcDebug = {
  // function that marks any damaged buildings
  markDamaged : function(room){
    var structures = room.find(FIND_STRUCTURES, {filter:(structure)=>(structure.hits < structure.hitsMax)})
    for (var s in structures){
      var structure = structures[s];
      room.visual.text("💥", structure.pos.x, structure.pos.y);
    }
  }
};



module.exports = funcDebug;
