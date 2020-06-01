var funcStruct = require('func.structures');
var funcDebug = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // function that marks any damaged buildings
  markDamaged : function(room){
    var structures = funcStruct.getBroken(room);
    for (var s in structures){
      var structure = structures[s];
      room.visual.text("💥", structure.pos.x, structure.pos.y);
    }
  }

};



module.exports = funcDebug;
