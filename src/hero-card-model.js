/**
 * Created by 赢潮 on 2015/2/25.
 */
var HeroModel = Backbone.Model.extend({ //英雄牌
    defaults:function(){
        return {
            name: "",
            type:"hero",
            backType:"hero",
            displayName: "",
            baseMaxHp: 1,
            maxHp: 1,
            hp: 1,

            baseScore: 1,
            score: 1,

            baseDefense: 0,
            defense: 0,
            defenseBuff: 0,
            defenseDebuff: 0,

            level: 1,
            maxLevel: 3,
            positionInTeam: null,
            attackHeartPower: 1,

            poison: 0,
            slow: 0,
            silent: 0,

            poisonReduce: 1,
            poisonResistance: 0,
            slowReduce: 1,
            slowResistance: 1,
            silentReduce: 1,
            silentResistance: 0,

            bite: false,

            dodge:{

            },

            carry: [ "potion" ],

            skills : {}
        }
    },
    initialize:function(){
        this.__joinTeamOver = false;
        this.initByLevel();
        this.evaluateMaxHp();
        this.evaluateScore();
        this.evaluateDefense();

        this.set("maxHp",this.get("baseMaxHp"), {silent:true});
        this.set("hp",this.get("maxHp"), {silent:true});
        this.__initEvent();
    },
    __initEvent:function(){
        this.on("change:hp",this.onChangeHp,this);
        this.on("change:level",this.onChangeLevel,this);
        this.on("change:baseScore", this.evaluateScore, this);
        this.on("change:baseMaxHp", this.evaluateMaxHp, this);
        this.on("change:baseDefense change:defenseBuff change:defenseDebuff", this.evaluateDefense, this);
     },
    onChangeHp:function(){
        if ( this.get("hp") <= 0 ) {
            window.gameModel.getScore( this.get("score"));
            window.gameModel.getExp( this.getExp() );
            this.onDie();
            if ( this.get("bite") ) {
                this.trigger("transform");
            } else {
                this.trigger("die");
            }
        } else if ( this.previous("hp") <= 0 ) {
            cc.log("alive");
            this.trigger("alive");
            this.onAlive();
        }
    },
    onChangeLevel:function(){
        this.initByLevel();
    },
    evaluateScore:function(){
        this.set("score", this.get("baseScore"))
    },
    evaluateMaxHp:function(){
        this.set("maxHp", this.get("baseMaxHp"));
    },
    evaluateDefense:function(){
        this.set("defense", Math.max(0, this.get("baseDefense") + this.get("defenseBuff") - this.get("defenseDebuff")));
    },
    getDescription:function(){
        var desc = [];
        desc.push( "英雄" );
        if ( this.get("score") ) {
            desc.push( "{[score]}杀死英雄得到"+this.get("score")+"分和"+this.getExp()+"经验");
        }
        if ( this.get("defense") ) {
            desc.push( "{[defense]}怪物对该英雄的伤害减"+this.get("defense"));
        }
        if ( this.get("slow") ) {
            desc.push( "{[slow]}迟缓("+this.get("slow")+"轮)被同一个怪物攻击2次");
        }
        if ( this.get("poison") ) {
            desc.push( "{[poison]}中毒("+this.get("poison")+"轮)每经过1间房间-1{[hp]}");
        }
        if ( this.get("silent") ) {
            desc.push( "{[silent]}封印("+this.get("silent")+"轮)不能使用主动技能");
        }
        var dodges = this.get("dodge");
        if ( dodges.trap ) {
            desc.push( (dodges.trap)+"%不受陷阱影响");
        }
        if ( dodges.att1 ) {
            desc.push( (dodges.att1 )+"%躲避{[attack]}1及以下的怪物攻击");
        }
        if ( dodges.att2 ) {
            desc.push( (dodges.att2 )+"%躲避{[attack]}2及以下的怪物攻击");
        }
        if ( dodges.att3 ) {
            desc.push( (dodges.att3 )+"%躲避{[attack]}3及以下的怪物攻击");
        }
        if ( dodges.att8 ) {
            desc.push( (dodges.att8 )+"%躲避{[attack]}8及以上的怪物攻击");
        }
        if ( dodges.att7 ) {
            desc.push( (dodges.att7 )+"%躲避{[attack]}7及以上的怪物攻击");
        }
        if ( dodges.att6 ) {
            desc.push( (dodges.att6 )+"%躲避{[attack]}6及以上的怪物攻击");
        }
        if ( dodges.att5 ) {
            desc.push( (dodges.att5 )+"%躲避{[attack]}5及以上的怪物攻击");
        }
        if ( dodges.spell ) {
            desc.push( (dodges.spell )+"%躲避法术的伤害");
        }
        var skills = this.get("skills");
        if ( skills.steal ) {
            desc.push( "每经过"+skills.steal.maxCoolDown+"间房间，偷走"+skills.steal.effect+"{[money]}" );
        }
        if ( skills.heal ) {
            desc.push( "每经过"+skills.heal.maxCoolDown+"间房间，回复最前的受伤英雄"+skills.heal.effect+"{[hp]}" );
        }
        if ( skills.resurrection ) {
            desc.push( "每经过"+skills.resurrection.maxCoolDown+"间房间复活1个死去的英雄并恢复其"+skills.resurrection.effect+"{[hp]}" );
        }
        return desc.join("\n");
    },
    isMaxLevel:function(){
        return this.get("maxLevel") != "NA" && this.get("level") >= this.get("maxLevel");
    },
    isAlive:function(){
        return this.get("hp") > 0;
    },
    onBeforePositionInTeamChange:function(prevPosition){
    },
    onPositionInTeamChange:function(prevPosition, position){
    },
    onEnterDungeon:function(){
    },
    onPassDungeon:function(){
        this.resetToOrigin();
        var level = this.get("level");
        if ( level < this.get("maxLevel") ) {
            this.set("level", level + 1);
        } else {
            this.set("leaving", true);
        }

        var hp = this.get("hp");
        var maxHp = this.get("maxHp");
        var diff = Math.max(0, maxHp - hp);
        if ( diff > 0 ) {
            var recovery = gameModel.getTavernRecoveryEffect(diff);
            if (recovery > 0) {
                this.set("hp", hp + recovery);
                this.trigger("give", {
                    icon: "money"
                });
                gameModel.getPayFromTavern(recovery);
            }
        } else {
            this.set("hp",maxHp);
        }
    },
    resetToOrigin:function(){
        this.set({
            slow:0,
            poison: 0,
            defenseBuff:0,
            defenseDebuff:0
        });
        var skills = this.get("skills");
        _.each(_.keys(skills), function(key) {
            var val = skills[key];
            val.coolDown = 0;
            val.maxCoolDown = val.baseMaxCoolDown;
        });
    },
    onEnterStage:function(){
    },
    onEnterRoom:function(roomModel){
    },
    onPassRoom:function(roomModel){
        this.set("bite", false);

        var poison = this.get("poison");
        if ( poison ) {
            this.onBeDamaged(window.gameModel.get("poisonEffect"),"poison");
            this.set("poison", Math.max(0,poison - this.get("poisonReduce")) );
        }

        var slow = this.get("slow");
        if ( slow ) {
            this.set("slow", Math.max(0,slow - this.get("slowReduce")) );
        }

        var silent = this.get("silent");
        if ( silent ) {
            this.set("silent", Math.max(0,silent - this.get("silentReduce")) );
        }

        if ( !this.isAlive() )
            return;

        if ( !silent ) {
            var skills = this.get("skills");
            _.each(_.keys(skills), function (key) {
                var val = skills[key];
                var coolDown = val.coolDown + 1;
                if (coolDown >= val.maxCoolDown) {
                    val.coolDown = 0;
                    SKILL_FUNC_MAP[key].call(this, val.effect);
                } else {
                    val.coolDown = coolDown
                }
            }, this);
        }
    },
    getPoison:function(amount){
        this.set("poison",this.get("poison")+amount);
    },
    getSlow:function(amount){
        this.set("slow",this.get("slow")+amount);
    },
    getSilent:function(amount){
        this.set("silent",this.get("silent")+amount);
    },
    onPassStage:function(){
    },
    onBeAttacked:function(damage,cardModel){
        var dodge = this.get("dodge");
        var dodgeRate = 0;
        if ( cardModel instanceof TrapModel ) {
            if ( dodge.trap )
                dodgeRate += dodge.trap;
        } else if ( cardModel instanceof MonsterModel ) {
            var att = cardModel.get("attack");
            if ( att <= 1 && dodge.att1 ) dodgeRate += dodge.att1;
            if ( att <= 2 && dodge.att2 ) dodgeRate += dodge.att2;
            if ( att <= 3 && dodge.att3 ) dodgeRate += dodge.att3;
            if ( att >= 5 && dodge.att5 ) dodgeRate += dodge.att5;
            if ( att >= 6 && dodge.att6 ) dodgeRate += dodge.att6;
            if ( att >= 7 && dodge.att7 ) dodgeRate += dodge.att7;
            if ( att >= 8 && dodge.att8 ) dodgeRate += dodge.att8;
        }
        if ( dodgeRate )
            return Math.random() > dodgeRate/100;
        return true;
    },
    onBeDamaged:function(damage, cardModel){
        var currentHp = this.get("hp");
        var realDefense = 0;
        var damageAfterBlock = 0;
        if ( cardModel instanceof Backbone.Model ) {
            var dodge = this.get("dodge");
            var dodgeRate = 0;
            if ( cardModel instanceof SpellModel ) {
                if ( dodge.spell ) dodgeRate += dodge.spell;
            }
            if ( Math.random() > dodgeRate/100 ) {
                realDefense = ( cardModel.get("type") === "spell" || cardModel.get("type") === "trap" || cardModel.get("pierce") ) ? 0 : this.get("defense");
                damageAfterBlock = Math.max(damage - realDefense, 0);

//                if (damageAfterBlock > currentHp) {
//                    if (cardModel.onOverKillHero) {
//                        cardModel.onOverKillHero(this, damageAfterBlock - currentHp);
//                    }
//                }
            }
        } else {
            var type = cardModel;
            if ( type.contains( "poison" ) ) {
                realDefense = this.get("poisonResistance");
            }

            damageAfterBlock = Math.max(damage - realDefense, 0);
        }

        var d = Math.min( currentHp , damageAfterBlock );
        this.set("hp", currentHp - d);

        return [d, damage - d - realDefense];
    },
    getHeal:function(heal){
        var currentHp = this.get("hp");
        this.set("hp", Math.min(this.get("maxHp"),currentHp + heal));
    },
    getDefense:function(amount){
        this.set("defenseBuff", this.get("defenseBuff") + 1);
    },
    loseDefense:function(amount){
        this.set("defense", Math.max(0, this.get("defense") - amount ));
    },
    onAttackHeart:function(damange){
    },
    onDie:function(){
    },
    onAlive:function(){
    },
    getExp:function(){
        return this.get("score");
    }
})

var AmazonModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"amazon",
            displayName:"亚马逊战士",
            maxLevel: 5,
            baseDefense: 0,
            carry: ["cape","potion"]
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + Math.floor(level/2),
            dodge: {
                att1: level <= 3 ? Math.min(75, 25*level) : 0,
                att2: level >= 4? Math.min(75, 25*(level-3)) : 0
            }
        });
    }
});

var AssassinModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"assassin",
            displayName:"刺客",
            maxLevel: 5,
            carry: ["cape","potion"]
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level*2,
            baseScore: level*(level+1)/2,
            baseMaxHp: 2 + Math.ceil(level/2),
            baseDefense: 0,
            dodge: {
                att1: Math.min(100, 15*level)
            }
        });
    },
    getDescription:function(){
        var desc = HeroModel.prototype.getDescription.call(this);
        return desc + "\n" + "对地城之心的伤害加倍";
    }
});

var BerserkerModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"berserker",
            displayName:"狂战士",
            maxLevel: 5
        })
    },
    __initEvent:function(){
        HeroModel.prototype.__initEvent.call(this);
        this.on("change:hp change:baseMaxHp",this.evaluateAttackHeartPower,this);
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + Math.ceil(level/2),
            baseDefense: 0
        });
    },
    evaluateAttackHeartPower:function(){
        this.set("attackHeartPower", this.get("level") + this.get("maxHp") - this.get("hp"));
    },
    getDescription:function(){
        var desc = HeroModel.prototype.getDescription.call(this);
        return desc + "\n" + "自身受到多少伤害就额外对地城之心造成多少伤害";
    }
});

var ClericModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"cleric",
            displayName:"牧师",
            maxLevel: 5,
            baseDefense: 0,
            array: ["potion","elixir"],
            skills:{
                heal: {
                    coolDown: 0,
                    maxCoolDown: 2,
                    baseMaxCoolDown: 2
                }
            }
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 1 + level
        });
        if ( level >= 3 ) {
            this.get("skills").heal.baseMaxCoolDown = this.get("skills").heal.maxCoolDown = 1;
        }
        this.get("skills").heal.effect = Math.ceil(this.get("level")/2);
    }
});

var DragonSlayerModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"dragonslayer",
            displayName:"屠龙者",
            maxLevel: 5,
            baseDefense: 0,
            carry:["big-sword"]
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + level,
            dodge: {
                att7: level <= 1 ? 100 : 0,
                att6: level >= 2? 100 : 0,
                att5: level >= 4? 100 : 0
            }
        });
    }
});

var KnightModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"knight",
            displayName:"骑士",
            maxLevel: 5,
            baseDefense: 0,
            carry: ["helmet","armor"]
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1),
            baseMaxHp: 3 + level,
            baseDefense: Math.floor(level/2)
        });
    },
    onBeforePositionInTeamChange:function(prevPosition){
        var team = gameModel.get("team");
        if ( prevPosition + 1 < team.length ) {
            var heroModel = team[prevPosition+1];
            var buff = heroModel.get("defenseBuff");
            if ( buff ) {
                heroModel.set("defenseBuff", buff - 1 );
            }
        }
    },
    onPositionInTeamChange:function(prevPosition, position){
        var team = gameModel.get("team");
        if ( position + 1 < team.length ) {
            var heroModel = team[position+1];
            var buff = heroModel.get("defenseBuff");
            heroModel.set("defenseBuff", buff + 1 );
        }
    },
    onDie:function(){
        this.onBeforePositionInTeamChange(this.get("positionInTeam"))
        HeroModel.prototype.onDie.call(this);
    },
    onAlive:function(){
        HeroModel.prototype.onAlive.call(this);
        this.onPositionInTeamChange(null, this.get("positionInTeam"))
    },
    getDescription:function(){
        var desc = HeroModel.prototype.getDescription.call(this);
        return desc + "\n" + "为身后的英雄+"+this.getEffect()+"{[defense]}"
    },
    getEffect:function(){
        return this.get("level")
    }
});

var NinjaModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"ninja",
            displayName:"忍者",
            maxLevel: 5,
            baseDefense: 0,
            carry: [ "boot" ]
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 2 + level,
            dodge: {
                trap: Math.min( 100, level*25 )
            }
        });
    }
});

var SageModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"sage",
            displayName:"贤者",
            maxLevel: 5,
            baseDefense: 0,
            carry: ["elixir","sage","resurrection"],
            skills: {
                resurrection:{
                    coolDown: 0,
                    maxCoolDown: 4,
                    baseMaxCoolDown: 4
                }
            }
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 2 + Math.floor(level/2)
        });
        if ( level >= 4 ) {
            this.get("skills").resurrection.baseMaxCoolDown = this.get("skills").resurrection.maxCoolDown = 2;
        }
        this.get("skills").resurrection.effect = this.get("level");
    }
});

var SoldierModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"soldier",
            displayName:"士兵",
            maxLevel: 5,
            baseDefense: 0,
            carry: ["helmet"]
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1),
            baseMaxHp: 3 + level,
            baseDefense: Math.floor(level/2)
        });
    },
    onBeforePositionInTeamChange:function(prevPosition){
        var team = gameModel.get("team");
        if ( prevPosition - 1 >= 0 ) {
            var heroModel = team[prevPosition-1];
            var buff = heroModel.get("defenseBuff");
            if ( buff ) {
                heroModel.set("defenseBuff", buff - 1 );
            }
        }
    },
    onPositionInTeamChange:function(prevPosition, position){
        var team = gameModel.get("team");
        if ( position - 1 >= 0 ) {
            var heroModel = team[position-1];
            var buff = heroModel.get("defenseBuff");
            heroModel.set("defenseBuff", buff + 1 );
        }
    },
    onDie:function(){
        this.onBeforePositionInTeamChange(this.get("positionInTeam"))
        HeroModel.prototype.onDie.call(this);
    },
    onAlive:function(){
        HeroModel.prototype.onAlive.call(this);
        this.onPositionInTeamChange(null, this.get("positionInTeam"))
    },
    getDescription:function(){
        var desc = HeroModel.prototype.getDescription.call(this);
        return desc + "\n" + "为身前的英雄+"+this.getEffect()+"{[defense]}"
    },
    getEffect:function(){
        return this.get("level")
    }
});

var SorcererModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"sorcerer",
            displayName:"法师",
            maxLevel: 4,
            baseDefense: 0,
            carry: ["staff"],
            dodge: {
                spell: 100
            }
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 2 + level
        });
    }
});

var ThiefModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"thief",
            displayName:"盗贼",
            maxLevel: 5,
            baseDefense: 0,
            carry: ["lockpicker"],
            skills:{
                steal: {
                    coolDown: 0,
                    maxCoolDown: 2,
                    baseMaxCoolDown: 2
                }
            }
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + Math.floor(level/2)
        });
        if ( level >= 4 ) {
            this.get("skills").steal.maxCoolDown = this.get("skills").steal.baseMaxCoolDown = 1;
        }
        this.get("skills").steal.effect = Math.ceil(this.get("level")/2)
    }
});


var WarriorModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"warrior",
            displayName:"战士",
            maxLevel: 4,
            baseDefense: 0
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            attackHeartPower: level,
            baseScore: level*(level+1)/2,
            baseMaxHp: 2 + level*2,
            baseDefense: 0
        });
    }
});

var SKILL_FUNC_MAP = {
    steal: function(effect){
        gameModel.useMoney(effect);
        this.trigger("take",{
            icon: "money"
        });
    },
    heal: function(effect){
        var team = gameModel.get("team");
        var hero = _.first(_.filter(team, function (heroModel) {
            var hp = heroModel.get("hp");
            return hp > 0 && hp < heroModel.get("maxHp");
        }, this));
        if (hero) {
            hero.getHeal(effect);
        }
    },
    resurrection:function(effect){
        var team = gameModel.get("team");
        var dead = _.filter(team, function(heroModel){
            return !heroModel.isAlive();
        },this);
        var first = _.first(dead);
        if ( first ) {
            first.set("hp", Math.min(effect, first.get("maxHp")));
        }
    }
}

var HERO_CLASS_MAP = {
    amazon: AmazonModel,
    assassin: AssassinModel,
    berserker: BerserkerModel,
    cleric : ClericModel,
    dragonslayer: DragonSlayerModel,
    knight: KnightModel,
    ninja: NinjaModel,
    sage: SageModel,
    soldier: SoldierModel,
    sorcerer: SorcererModel,
    thief: ThiefModel,
    warrior : WarriorModel
}
