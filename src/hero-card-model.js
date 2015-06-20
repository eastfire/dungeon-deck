/**
 * Created by 赢潮 on 2015/2/25.
 */
var DODGE_TRAP_RATE = 25;

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

            poison: 0,
            slow: 0,

            poisonReduce: 1,
            poisonResistance: 0,
            slowReduce: 1,
            slowResistance: 1,

            coolDown: 0,
            maxCoolDown: 0,
            baseMaxCoolDown: 2,

            bite: false,

            dodge:{

            }
        }
    },
    initialize:function(){
        this.__joinTeamOver = false;
        this.initByLevel();
        this.evaluateMaxHp();
        this.evaluateScore();
        this.evaluateDefense();
        this.evaluateMaxCoolDown();

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
        this.on("change:baseMaxCoolDown", this.evaluateMaxCoolDown, this);
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
    evaluateMaxCoolDown:function(){
        this.set("maxCoolDown", this.get("baseMaxCoolDown"));
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
        if ( this.get("dodge").trap ) {
            desc.push( (this.get("dodge").trap * DODGE_TRAP_RATE )+"%不受陷阱影响");
        }
        if ( this.get("dodge").att1 ) {
            desc.push( (this.get("dodge").att1 )+"%躲避{[attack]}1及以下的怪物攻击");
        }
        if ( this.get("dodge").att2 ) {
            desc.push( (this.get("dodge").att2 )+"%躲避{[attack]}2及以下的怪物攻击");
        }
        if ( this.get("dodge").att3 ) {
            desc.push( (this.get("dodge").att3 )+"%躲避{[attack]}3及以下的怪物攻击");
        }
        if ( this.get("dodge").att7 ) {
            desc.push( (this.get("dodge").att7 )+"%躲避{[attack]}7及以上的怪物攻击");
        }
        if ( this.get("dodge").att6 ) {
            desc.push( (this.get("dodge").att6 )+"%躲避{[attack]}6及以上的怪物攻击");
        }
        if ( this.get("dodge").att5 ) {
            desc.push( (this.get("dodge").att5 )+"%躲避{[attack]}5及以上的怪物攻击");
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
            coolDown: 0,
            maxCoolDown: this.get("baseMaxCoolDown"),
            slow:0,
            poison: 0,
            defenseBuff:0,
            defenseDebuff:0
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
            this.set("poison", poison - this.get("poisonReduce") );
        }

        var slow = this.get("slow");
        if ( slow ) {
            this.set("slow", slow - this.get("slowReduce") );
        }
    },
    coolDown:function(){
        var coolDown = this.get("coolDown") + 1;
        if ( coolDown >= this.get("maxCoolDown") ){
            this.set("coolDown", 0 );
            return true;
        } else {
            this.set("coolDown", coolDown);
            return false;
        }
    },
    getPoison:function(amount){
        this.set("poison",this.get("poison")+amount);
    },
    getSlow:function(amount){
        this.set("slow",this.get("slow")+amount);
    },
    onPassStage:function(){
    },
    onBeAttacked:function(damage,cardModel){
        if ( cardModel instanceof TrapModel ) {
            if ( this.get("dodge").trap ) return Math.random() < this.get("dodge").trap * DODGE_TRAP_RATE/100;
        } else if ( cardModel instanceof MonsterModel ) {

        }
        return true;
    },
    onBeDamaged:function(damage, cardModel){
        var currentHp = this.get("hp");
        var realDefense = 0;
        var damageAfterBlock;
        if ( cardModel instanceof Backbone.Model ) {
            realDefense = ( cardModel.get("type") === "spell" || cardModel.get("type") === "trap" || cardModel.get("pierce") ) ? 0 : this.get("defense");
            damageAfterBlock = Math.max(damage - realDefense, 0);

            if (damageAfterBlock > currentHp) {
                if (cardModel.onOverKillHero) {
                    cardModel.onOverKillHero(this, damageAfterBlock - currentHp);
                }
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

        return d;
    },
    getHeal:function(heal){
        var currentHp = this.get("hp");
        this.set("hp", Math.min(this.get("maxHp"),currentHp + heal));
    },
    loseDefense:function(amount){
        this.set("defense", Math.max(0, this.get("defense") - amount ));
    },
    getAttackHeartPower:function(){
        return this.get("level")
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



var ClericModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"cleric",
            displayName:"牧师",
            maxLevel: 5,
            baseDefense: 0
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseScore: level*(level+1)/2,
            baseMaxHp: 1 + level
        });
        if ( level >= 3 ) {
            this.set("baseMaxCoolDown",1);
        }
    },
    getDescription:function(){
        var desc = HeroModel.prototype.getDescription.call(this);
        return desc + "\n" + "每经过"+this.get("maxCoolDown")+"间房间，排在队伍最前的受伤英雄恢复"+this.getEffect()+"{[hp]}"
    },
    onPassRoom:function(){
        HeroModel.prototype.onPassRoom.call(this);
        if ( !this.isAlive() )
            return;

        if ( this.coolDown() ) {
            var team = gameModel.get("team");
            var hero = _.first(_.filter(team, function (heroModel) {
                var hp = heroModel.get("hp");
                return hp > 0 && hp < heroModel.get("maxHp");
            }, this));
            if (hero) {
                hero.getHeal(this.getEffect());
            }
        }
    },
    getEffect:function(){
        return Math.ceil(this.get("level")/2);
    }
});

var KnightModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"knight",
            displayName:"骑士",
            maxLevel: 4,
            baseDefense: 0
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + level,
            baseDefense: level - 1
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
            maxLevel: 4,
            baseDefense: 0
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + level,
            dodge: {
                trap: Math.min( Math.ceil(100/DODGE_TRAP_RATE), level+1)
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
            baseDefense: 0
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + Math.floor(level/2),
            baseMaxCoolDown: 4
        });
        if ( level >= 4 ) {
            this.set("baseMaxCoolDown",2);
        }
    },
    getDescription:function(){
        var desc = HeroModel.prototype.getDescription.call(this);
        return desc + "\n" + "每经过"+this.get("maxCoolDown")+"间房间复活1个死去的英雄并恢复其"+this.getEffect()+"{[hp]}"
    },
    onPassRoom:function(){
        HeroModel.prototype.onPassRoom.call(this);
        if ( !this.isAlive() )
            return;

        if ( this.coolDown() ) {
            var team = gameModel.get("team");
            var dead = _.filter(team, function(heroModel){
                return !heroModel.isAlive();
            },this);
            var first = _.first(dead);
            if ( first ) {
                first.set("hp", Math.min(this.getEffect(), first.get("maxHp")));
            }
        }
    },
    getEffect:function(){
        return this.get("level")
    }
});

var ThiefModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"thief",
            displayName:"盗贼",
            maxLevel: 5,
            baseDefense: 0
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + Math.floor(level/2)
        });
        if ( level >= 4 ) {
            this.set("baseMaxCoolDown",1);
        }
    },
    getDescription:function(){
        var desc = HeroModel.prototype.getDescription.call(this);
        return desc + "\n" + "每经过"+this.get("maxCoolDown")+"间房间，偷走"+this.getEffect()+"{[money]}"
    },
    onPassRoom:function(){
        HeroModel.prototype.onPassRoom.call(this);
        if ( !this.isAlive() )
            return;

        if ( this.coolDown() ) {
            gameModel.useMoney(this.getEffect());
            this.trigger("take",{
                icon: "money"
            });
        }
    },
    getEffect:function(){
        return Math.ceil(this.get("level")/2);
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
            baseScore: level*(level+1)/2,
            baseMaxHp: 3 + level,
            baseDefense: level - 1
        });
    }
});

var HERO_CLASS_MAP = {
    cleric : ClericModel,
    knight: KnightModel,
    ninja: NinjaModel,
    sage: SageModel,
    thief: ThiefModel,
    warrior : WarriorModel
}
