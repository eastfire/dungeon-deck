/**
 * Created by 赢潮 on 2015/4/12.
 */
var RoomModel = DungeonCardModel.extend({ //房间
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this),{
            type: "room"
        })
    },
    onTeamEnter:function(team){
    },
    onTeamPass:function(team){
    }
})


var VaultModel = RoomModel.extend({
    defaults:function(){
        return _.extend(RoomModel.prototype.defaults.call(this), {
            baseCost: 10,
            name:"vault",
            displayName:"金库",

            maxLevel: 3,
            upgradeable: false
        })
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
//        if ( this.get("level") === 1 ) {
            return desc + "金币上限+"+this.getEffect()
//        } else {
//            return desc + "金币上限+"+this.getEffect()+"\n经过本房间时英雄夺走"+this.getEffect(this.get("level")-1)+"{[money]}";
//        }
    },
    getEffect:function(level){
        level = level || this.get("level");
        return level * 5;
    },
    onGain:function(){
        window.gameModel.set("maxMoney", window.gameModel.get("maxMoney") + this.getEffect());
    },
    onExile:function(){
        window.gameModel.set("maxMoney", window.gameModel.get("maxMoney") - this.getEffect());
        window.gameModel.set("money", Math.min(window.gameModel.get("money"), window.gameModel.get("maxMoney")));
    },
    onLevelUp:function(){
        window.gameModel.set("maxMoney", window.gameModel.get("maxMoney") + this.getEffect() - this.getEffect(this.get("level")-1) );
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseUpgradeCost: level*10
        } );
        this.reEvaluate();
    }

})

var HenDenModel = RoomModel.extend({
    defaults:function(){
        return _.extend(RoomModel.prototype.defaults.call(this), {
            baseCost: 10,
            name:"hen-den",
            displayName:"鸡窝",

            maxLevel: 3,
            upgradeable: false
        })
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
//        if ( this.get("level") === 1 ) {
            return desc + "地城之心HP上限+"+this.getEffect()
//        } else {
//            return "地城之心HP上限+"+this.getEffect()+"\n经过本房间时所有英雄+"+this.getEffect(this.get("level")-1)+"{[hp]}";
//        }
    },
    getEffect:function(level){
        level = level || this.get("level");
        return level * 5;
    },
    onGain:function(){
        window.gameModel.set("maxHp", window.gameModel.get("maxHp") + this.getEffect());
    },
    onExile:function(){
        window.gameModel.set("maxHp", window.gameModel.get("maxHp") - this.getEffect());
        window.gameModel.set("hp", Math.min(window.gameModel.get("hp"), window.gameModel.get("maxHp")));
    },
    onLevelUp:function(){
        window.gameModel.set("maxHp", window.gameModel.get("maxHp") + this.getEffect() - this.getEffect(this.get("level")-1) );
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseUpgradeCost: level*10
        } );
        this.reEvaluate();
    }

})