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

var ArmorModel = ItemModel.extend({ //物品
    defaults:function(){
        return _.extend( ItemModel.prototype.defaults.call(this),{
            name: "armor",
            displayName: "盔甲"
        })
    },
    initialize:function(){
        var level = this.get("level");
        this.set("score", level * level);
    },
    getDescription:function(){
        var desc = ItemModel.prototype.getDescription.call(this);
        var descs = [desc];
        descs.push("队首的英雄+"+this.getEffect()+"{[defense]}");
        return descs.join("\n");
    },
    onHeroGet:function(team){
        var alive = _.filter( team ,function(model){
            return model.isAlive();
        }, this )
        var hero = _.first( alive );
        if ( hero )
            hero.getDefense(this.getEffect());
    },
    getEffect:function(){
        return Math.ceil(this.get("level")/3);
    }
});

var HelmetModel = ItemModel.extend({ //物品
    defaults:function(){
        return _.extend( ItemModel.prototype.defaults.call(this),{
            name: "helmet",
            displayName: "头盔"
        })
    },
    initialize:function(){
        this.set("score",this.get("level"));
    },
    getDescription:function(){
        var desc = ItemModel.prototype.getDescription.call(this);
        var descs = [desc];
        descs.push("队首的英雄+"+this.getEffect()+"{[defense]}");
        return descs.join("\n");
    },
    onHeroGet:function(team){
        var alives = _.filter( team ,function(model){
            return model.isAlive();
        }, this )
        var hero = _.first( alives );
        if ( hero )
            hero.getDefense(this.getEffect());
    },
    getEffect:function(){
        return Math.ceil(this.get("level")/4);
    }
});

var ResurrectionPotionModel = ItemModel.extend({ //物品
    defaults:function(){
        return _.extend( ItemModel.prototype.defaults.call(this),{
            name: "resurrection",
            displayName: "复活药"
        })
    },
    initialize:function(){
        var level = this.get("level");
        this.set("score",level*(level+1)/2);
    },
    getDescription:function(){
        var desc = ItemModel.prototype.getDescription.call(this);
        var descs = [desc];
        descs.push("复活排最前的死亡英雄并恢复"+this.getEffect()+"{[hp]}");
        return descs.join("\n");
    },
    onHeroGet:function(team){
        var team = gameModel.get("team");
        var dead = _.filter(team, function(heroModel){
            return !heroModel.isAlive();
        },this);
        var first = _.first(dead);
        if ( first ) {
            first.set("hp", Math.min(this.getEffect(), first.get("maxHp")));
        }
    },
    getEffect:function(){
        return this.get("level");
    }
});

var PotionModel = ItemModel.extend({ //物品
    defaults:function(){
        return _.extend( ItemModel.prototype.defaults.call(this),{
            name: "potion",
            displayName: "回复药"
        })
    },
    initialize:function(){
        this.set("score",this.get("level"));
    },
    getDescription:function(){
        var desc = ItemModel.prototype.getDescription.call(this);
        var descs = [desc];
        var level = this.get("level");
        if ( level <= 6 )
            descs.push("第一个受伤的英雄恢复"+this.getEffect()+"{[hp]}");
        else
            descs.push("所有英雄恢复"+this.getEffect()+"{[hp]}");
        return descs.join("\n");
    },
    onHeroGet:function(team){
        var allHurt = _.filter( team ,function(model){
            return model.isAlive() && model.get("maxHp") > model.get("hp");
        }, this )
        var level = this.get("level");
        if ( level <= 6 ) {
            var hero = _.first(allHurt);
            if (hero)
                hero.getHeal(this.getEffect());
        } else {
            _.each(allHurt,function(hero){
                hero.getHeal(this.getEffect());
            })
        }
    },
    getEffect:function(){
        var level = this.get("level");
        if ( level <= 6 )
            return level;
        else return Math.floor(this.get("level") / 2);
    }
});

var StaffModel = ItemModel.extend({ //物品
    defaults:function(){
        return _.extend( ItemModel.prototype.defaults.call(this),{
            name: "staff",
            displayName: "法杖"
        })
    },
    initialize:function(){
        this.set("score",this.get("level"));
    },
    getDescription:function(){
        var desc = ItemModel.prototype.getDescription.call(this);
        var descs = [desc];
        descs.push("队尾英雄永久增加魔法免疫"+this.getEffect()+"%");
        return descs.join("\n");
    },
    onHeroGet:function(team){
        var alive = _.filter( team ,function(model){
            return model.isAlive();
        }, this )
        var hero = _.last( alive );
        if ( hero ) {
            var dodge = hero.get("dodge");
            if (dodge.spell){
                dodge.spell+=this.getEffect();
            } else dodge.spell=this.getEffect();
        }
    },
    getEffect:function(){
        return Math.min(100, this.get("level")*10);
    }
});

var ElixirModel = ItemModel.extend({ //物品
    defaults:function(){
        return _.extend( ItemModel.prototype.defaults.call(this),{
            name: "elixir",
            displayName: "万灵药"
        })
    },
    initialize:function(){
        this.set("score",this.get("level"));
    },
    getDescription:function(){
        var desc = ItemModel.prototype.getDescription.call(this);
        var descs = [desc];
        var level = this.get("level");
        if ( level <= 4 )
            descs.push("第一个状态异常的英雄消除异常状态");
        else
            descs.push("所有英雄消除异常状态");
        return descs.join("\n");
    },
    onHeroGet:function(team){
        var allHurt = _.filter( team ,function(model){
            return model.isAlive() && (model.get("poison") || model.get("slow"));
        }, this )
        var level = this.get("level");
        if ( level <= 4 ) {
            var hero = _.first(allHurt);
            if (hero)
                hero.set({
                    slow: 0,
                    poison: 0
                });
        } else {
            _.each(allHurt,function(hero){
                hero.set({
                    slow: 0,
                    poison: 0
                });
            })
        }
    }
});