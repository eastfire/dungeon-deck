/**
 * Created by 赢潮 on 2015/2/25.
 */
var SpellModel = DungeonCardModel.extend({ //法术
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this),{
            type: "spell",
            target: null, // none, all-hero, random-hero, single-hero, single-dungeon, single-monster, single-room, , item, cardInDiscard, cardInDeck
            timing: null //
        })
    },
    onCast:function(options){
        options = options || {};
        switch ( this.get("target") ){
            case null: case "all-hero":
                this.onEffect();
            break;
            case "single-hero":
                this.trigger("please-choose-hero", _.extend(options,{
                    hint: texts.please_choose_target_hero_for_spell
                }));
                break;
            case "single-dungeon":
                this.trigger("please-choose-dungeon", _.extend(options,{
                    hint: texts.please_choose_target_dungeon_for_spell
                }));
                break;
            case "single-dungeon-monster":
                this.trigger("please-choose-dungeon", _.extend(options,{
                    hint: texts.please_choose_target_dungeon_for_spell,
                    filter:function(model){
                        return model.get("type") === "monster";
                    }
                }));
                break;
        }
    },
    onEffect:function(){
        this.trigger("cast-spell-finish",this);
    },
    onSelectTarget:function(heroModel){
        this.onEffect(heroModel);
    }
})

var MagicMissileModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"magic-missile",
            displayName:"魔导弹",
            target: "single-hero",
            baseCost: 1,
            baseAttack: 1,
            attack: 1,
            maxLevel:3
        })
    },
    initEvent:function(){
        SpellModel.prototype.initEvent.call(this);
        this.on("change:baseAttack change:attackBuff change:attackDebuff", this.evaluateAttack, this);
    },
    reEvaluate:function(){
        SpellModel.prototype.reEvaluate.call(this);
        this.evaluateAttack();
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    evaluateAttack:function(){
        this.set("attack", this.get("baseAttack"))
    },
    getEffect:function(level){
        return this.get("attack");
    },
    onEffect:function(heroModel){
        heroModel.onBeDamaged(this.getEffect(), this);
        SpellModel.prototype.onEffect.call(this);
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "选择1个英雄对其造成"+this.getEffect()+"点伤害"
    }
})

var LighteningModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"lightening",
            displayName:"闪电链",
            target: "all-hero",
            baseCost: 1,
            baseAttack: 1,
            attack: 1
        })
    },
    initialize:function(){
        SpellModel.prototype.initialize.call(this);
        this.on("change:baseAttack change:attackBuff change:attackDebuff", this.evaluateAttack, this)
    },
    evaluateAttack:function(){
        this.set("attack", this.get("baseAttack"))
    },
    getEffect:function(level){
        return this.get("attack");
    },
    onEffect:function(){
        _.each( gameModel.get("team"),function(heroModel){
            heroModel.onBeDamaged(this.getEffect(), this);
        },this);
        SpellModel.prototype.onEffect.call(this);
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "对每个英雄造成"+this.getEffect()+"点伤害"
    }
})

var FireballModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"fireball",
            displayName:"火球术",
            target: "single-hero",
            baseCost: 1,
            baseAttack: 2,
            attack: 2
        })
    },
    initialize:function(){
        SpellModel.prototype.initialize.call(this);
        this.on("change:baseAttack change:attackBuff change:attackDebuff", this.evaluateAttack, this)
    },
    onEffect:function(heroModel){
        heroModel.onBeDamaged(this.getEffect(), this);
        var team = gameModel.get("team");
        var index = _.indexOf(team, heroModel);
        if ( index - 1 >= 0 && team[index-1].isAlive()) {
            team[index-1].onBeDamaged(this.getEffect()-1, this);
        }
        if ( index + 1 < team.length && team[index+1].isAlive()) {
            team[index+1].onBeDamaged(this.getEffect()-1, this);
        }
        SpellModel.prototype.onEffect.call(this);
    },
    evaluateAttack:function(){
        this.set("attack", this.get("baseAttack"))
    },
    getEffect:function(){
        return this.get("attack");
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "对英雄造成"+this.getEffect()+"点伤害，对其两旁的英雄造成"+(this.getEffect()-1)+"点伤害"
    }
});

var WarDrumModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"war-drum",
            displayName:"战鼓",
            target: "single-dungeon-monster",
            baseCost: 1,
            baseAttack: 0,
            attack: 0
        })
    },
    getEffect:function(){
        return this.get("level");
    },
    onEffect:function(dungeonModel){
        dungeonModel.set("attackBuff", dungeonModel.get("attackBuff")+this.getEffect());
        SpellModel.prototype.onEffect.call(this);
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "使地城中的1个怪物攻击力+"+this.getEffect()
    }
});

var TouchStoneModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"touchstone",
            displayName:"炼金术",
            target: null,
            baseCost: 6,
            baseAttack: 0,
            attack: 0,
            maxLevel: 3
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    getEffect:function(){
        return this.get("level");
    },
    onEffect:function(){
        gameModel.getMoney(this.getEffect());
        SpellModel.prototype.onEffect.call(this);
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "获得"+this.getEffect()+"{[money]}"
    }
});

var CycloneModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"cyclone",
            displayName:"狂风术",
            target: null,
            baseCost: 6,
            baseAttack: 0,
            attack: 0,
            maxLevel: 3
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    onEffect:function(){
        var level = this.get("level");
        var team = gameModel.get("team");
        if ( team.length > 1 ) {
            if (level == 1) {
                var i = 0;
                var oldPosition = 0;
                var thisHero = _.sample(team);
                _.each(team, function (heroModel) {
                    if ( heroModel != thisHero ) {
                        heroModel.___temp = i;
                        i++;
                    } else {
                        oldPosition = i;
                    }
                }, this);
                do {
                    thisHero.___temp = Math.random() * (team.length) - 1;
                } while ( Math.ceil(thisHero.___temp) == oldPosition );

                team = _.sortBy(team, function (heroModel) {
                    return heroModel.___temp;
                });
            } else if (level == 2) {
                var newTeam;
                do {
                    newTeam = _.shuffle(team, team.length);
                } while (_.isEqual(newTeam, team) );
                team = newTeam;
            } else if (level >= 3) {
                var newTeam = [];
                _.each(team, function (heroModel) {
                    newTeam.unshift(heroModel);
                }, this);
                team = newTeam;
            }
            gameModel.changeTeamPosition(team);
            /*gameModel.set("team", team);
            for (var i = 0; i < team.length; i++) {
                var model = team[i];
                model.set("positionInTeam", i, {silent: true});
                model.trigger("change:positionInTeam");
            }*/
        }
        SpellModel.prototype.onEffect.call(this);
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        var level = this.get("level");
        if ( level == 1 ) {
            return desc + "使1个英雄移动到队伍中某个随机位置"
        } else if ( level == 2 ) {
            return desc + "使英雄队伍的顺序变得随机"
        } else if ( level >= 3 ) {
            return desc + "使英雄队伍的顺序变得相反"
        }
    }
});

//TODO 扰乱英雄顺序
//TODO 回到一层地城起点
//TODO 将尸体变成僵尸