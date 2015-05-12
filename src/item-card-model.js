/**
 * Created by 赢潮 on 2015/3/22.
 */
var ItemModel = DungeonCardModel.extend({ //物品
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this),{
            type: "item",

            upgradeable: false
        })
    },
    onTeamEnter:function(team){
    },
    onTeamGet:function(team){
        var allAlive = _.filter( team ,function(model){
            return model.isAlive();
        }, this )
        var hero = _.first( allAlive );
        this.onHeroGet(hero);
        this.set("exiled",true);
        this.onExile();
    },
    onHeroGet:function(hero){

    }
});

var TreasureChestModel = ItemModel.extend({ //物品
    defaults:function(){
        return _.extend( ItemModel.prototype.defaults.call(this),{
            name: "treasure-chest",
            displayName: "宝箱"
        })
    },
    onHeroGet:function(hero){
        hero.getHeal(this.getEffect());
    },
    getEffect:function(){
        return this.get("level");
    }
});