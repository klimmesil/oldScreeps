var funcStruct = require('func.structures');
var funcDebug = {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // function that marks any damaged buildings
  markDamaged : function(room){
    return false;
  },

  markSources : function(room){
    // vars
    var i = room.name

    // for each source
    for (var id in Memory.sources[i]){
      // vars
      var info = Memory.sources[i][id];
      var source = Game.getObjectById(id);
      var container = Game.getObjectById(info.container);

      // paint two squares
      if (container) {
        room.visual.rect(source.pos.x-0.4, source.pos.y-0.4, 0.8, 0.8, {stroke: "#9b59b6", strokeWidth: 0.2, fill: null});
        room.visual.rect(container.pos.x-0.4, container.pos.y-0.4, 0.8, 0.8, {stroke: "#9b59b6", strokeWidth: 0.2, fill: null});
      }
      room.visual.rect(source.pos.x-0.5, source.pos.y-0.5, 1, 1, {stroke: "#f4d03f", strokeWidth: 0.1, fill: null});
    }
  },

  mark: function(obj){
    if (obj.pos) obj.room.visual.rect(obj.pos.x-0.5,obj.pos.y-0.5,1,1);
    else  Game.rooms[obj.roomName].visual.rect(obj.x-0.5,obj.y-0.5,1,1);
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // function that marks
  markAll : function(debugging){
    // for each room
    for (var i in Game.rooms){
      var room = Game.rooms[i];

      // mark
      if (debugging.damaged) this.markDamaged(room); // damaged
      if (debugging.sources) this.markSources(room); // sources
    }

  }

};

module.exports = funcDebug;
