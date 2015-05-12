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
        if ( this.get("level") === 1 ) {
            return "金币上限+"+this.getEffect()
        } else {
            return "金币上限+"+this.getEffect()+"\n英雄经过本房间时夺走"+this.getEffect(this.get("level")-1)+"{[money]}";
        }
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