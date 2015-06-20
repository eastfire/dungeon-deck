/**
 * Created by 赢潮 on 2015/3/22.
 */
var ItemModel = DungeonCardModel.extend({ //物品
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this),{
            type: "item",

            maxLevel: "NA",
            upgradeable: false,
            cullable: false
        })
    },
    onTeamEnter:function(team){
    },
    onTeamGet:function(team){
        gameModel.getScore(this.get("score"));
        this.onHeroGet(team);
        this.set("exiled",true);
        this.onExile();
    },

    getDescription:function() {
        var desc = DungeonCardModel.prototype.getDescription.call(this);
        var descs = [desc];
        if (this.get("score")) {
            descs.push("{[score]}宝物被英雄得到时你得" + this.get("score") + "分");
        }

        return descs.join("\n");
    }
});

var TreasureChestModel = ItemModel.extend({ //物品
    defaults:function(){
        return _.extend( ItemModel.prototype.defaults.call(this),{
            name: "treasure-chest",
            displayName: "宝箱"
        })
    },
    initialize:function(){
        this.set("score",this.get("level"));
    },
    onHeroGet:function(team){
        var allHurt = _.filter( team ,function(model){
            return model.isAlive() && model.get("maxHp") > model.get("hp");
        }, this )
        var hero = _.first( allHurt );
        if ( hero )
            hero.getHeal(this.getEffect());
    },
    getEffect:function(){
        return this.get("level");
    }
});