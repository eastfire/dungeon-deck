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
});


var BlacksmithModel = RoomModel.extend({
    defaults:function(){
        return _.extend(RoomModel.prototype.defaults.call(this), {
            baseCost: 10,
            name:"blacksmith",
            displayName:"铁匠铺",

            maxLevel: "NA",
            upgradeable: false
        })
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "建造地城花费{[money]}减"+this.getEffect()+"(至少1)";
    },
    getEffect:function(level){
        level = level || this.get("level");
        return level;
    },
    onGain:function(){
        RoomModel.prototype.onGain.call(this);
        window.gameModel.set("costCut", window.gameModel.get("costCut") + this.getEffect());
    },
    onExile:function(){
        RoomModel.prototype.onExile.call(this);
        window.gameModel.set("costCut", window.gameModel.get("costCut") - this.getEffect());
    },
    onLevelUp:function(){
        window.gameModel.set("costCut", window.gameModel.get("costCut") + this.getEffect() - this.getEffect(this.get("level")-1) );
    }
});

var HenDenModel = RoomModel.extend({
    defaults:function(){
        return _.extend(RoomModel.prototype.defaults.call(this), {
            baseCost: 10,
            name:"hen-den",
            displayName:"鸡窝",

            maxLevel: 3,
            upgradeable: true
        })
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "地城之心HP上限+"+this.getEffect()
    },
    getEffect:function(level){
        level = level || this.get("level");
        return level * 5;
    },
    onGain:function(){
        RoomModel.prototype.onGain.call(this);
        window.gameModel.set("maxHp", window.gameModel.get("maxHp") + this.getEffect());
    },
    onExile:function(){
        RoomModel.prototype.onExile.call(this);
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

});

var LibraryModel = RoomModel.extend({
    defaults:function(){
        return _.extend(RoomModel.prototype.defaults.call(this), {
            baseCost: 10,
            name:"library",
            displayName:"图书馆",

            maxLevel: "NA",
            upgradeable: false
        })
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "魔法手牌上限+"+this.getEffect()
    },
    getEffect:function(level){
        level = level || this.get("level");
        return level;
    },
    onGain:function(){
        RoomModel.prototype.onGain.call(this);
        window.gameModel.set("maxHand", window.gameModel.get("maxHand") + this.getEffect());
    },
    onExile:function(){
        RoomModel.prototype.onExile.call(this);
        window.gameModel.set("maxHand", window.gameModel.get("maxHand") - this.getEffect());
    },
    onLevelUp:function(){
        window.gameModel.set("maxHand", window.gameModel.get("maxHand") + this.getEffect() - this.getEffect(this.get("level")-1) );
    }
});

var PrisonModel = RoomModel.extend({
    defaults:function(){
        return _.extend(RoomModel.prototype.defaults.call(this), {
            baseCost: 10,
            name:"prison",
            displayName:"监狱",

            maxLevel: "NA",
            upgradeable: false
        })
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "地城之心升级所需经验减"+(this.getEffect()*window.gameModel.get("cunningEffect"))+"%";
    },
    getEffect:function(level){
        level = level || this.get("level");
        return level;
    },
    onGain:function(){
        RoomModel.prototype.onGain.call(this);
        window.gameModel.set("cunning", window.gameModel.get("cunning") + this.getEffect());
    },
    onExile:function(){
        RoomModel.prototype.onExile.call(this);
        window.gameModel.set("cunning", window.gameModel.get("cunning") - this.getEffect());
    },
    onLevelUp:function(){
        window.gameModel.set("cunning", window.gameModel.get("cunning") + this.getEffect() - this.getEffect(this.get("level")-1) );
    }
});

var SpoiledFoodModel = RoomModel.extend({
    defaults:function(){
        return _.extend(RoomModel.prototype.defaults.call(this), {
            baseCost: 10,
            name:"spoiled-food",
            displayName:"腐烂食物",

            maxLevel: "NA",
            upgradeable: false
        })
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "英雄在酒店少恢复"+this.getEffect()+"{[hp]}";
    },
    getEffect:function(level){
        level = level || this.get("level");
        return level;
    },
    onGain:function(){
        RoomModel.prototype.onGain.call(this);
        window.gameModel.set("spoiled", window.gameModel.get("spoiled") + this.getEffect());
    },
    onExile:function(){
        RoomModel.prototype.onExile.call(this);
        window.gameModel.set("spoiled", window.gameModel.get("spoiled") - this.getEffect());
    },
    onLevelUp:function(){
        window.gameModel.set("spoiled", window.gameModel.get("spoiled") + this.getEffect() - this.getEffect(this.get("level")-1) );
    }
});



var VaultModel = RoomModel.extend({
    defaults:function(){
        return _.extend(RoomModel.prototype.defaults.call(this), {
            baseCost: 5,
            name:"vault",
            displayName:"金库",

            maxLevel: 3,
            upgradeable: true
        })
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "{[money]}上限+"+this.getEffect()
    },
    getEffect:function(level){
        level = level || this.get("level");
        return level * 4;
    },
    onGain:function(){
        RoomModel.prototype.onGain.call(this);
        window.gameModel.set("maxMoney", window.gameModel.get("maxMoney") + this.getEffect());
    },
    onExile:function(){
        RoomModel.prototype.onExile.call(this);
        window.gameModel.set("maxMoney", window.gameModel.get("maxMoney") - this.getEffect());
        window.gameModel.set("money", Math.min(window.gameModel.get("money"), window.gameModel.get("maxMoney")));
    },
    onLevelUp:function(){
        window.gameModel.set("maxMoney", window.gameModel.get("maxMoney") + this.getEffect() - this.getEffect(this.get("level")-1) );
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseUpgradeCost: level*10+5
        } );
        this.reEvaluate();
    }

})