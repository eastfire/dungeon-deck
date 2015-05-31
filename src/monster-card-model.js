/**
 * Created by 赢潮 on 2015/2/25.
 */
var MonsterModel = DungeonCardModel.extend({ //怪物牌
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this), {
            type: "monster",
            subType: null,
            baseAttack: 1,
            attack: 1,
            attackBuff: 0,
            attackDebuff: 0,
            attackType: "melee",
            attackRange: "first",
            status: null
        })
    },
    initEvent:function(){
        DungeonCardModel.prototype.initEvent.call(this);
        this.on("change:baseAttack change:attackBuff change:attackDebuff", this.evaluateAttack, this);
    },
    reEvaluate:function(){
        DungeonCardModel.prototype.reEvaluate.call(this);
        this.evaluateAttack();
    },
    evaluateAttack:function(){
        var baseAttack = this.get("baseAttack");

        if ( isValidInt( baseAttack ) ) {
            this.set("attack", Math.max(0,baseAttack + this.get("attackBuff") - this.get("attackDebuff")));
        } else {

            this.set("attack", baseAttack);
        }
    },
    onStageReveal:function(dungeonCards){
        this.evaluateAttack();
    },
    onTeamEnter:function(team){
    },
    onAttackTeam:function(team, damageLeft){
        var att = damageLeft || this.get("attack");
        //find all alive hero
        var allAlive = _.filter( team ,function(model){
            return model.isAlive();
        }, this )
        if ( allAlive.length > 0 ) {
            switch (this.get("attackRange")) {
                case "first":
                    var heroModel = _.first(allAlive);
                    this.onAttackHero(heroModel, att);
                    break;
                case "first2":
                    var heroes = _.first(allAlive,2);
                    _.each(heroes, function (heroModel) {
                        this.onAttackHero(heroModel, att);
                    }, this);
                    break;
                case "first3":
                    var heroes = _.first(allAlive,3);
                    _.each(heroes, function (heroModel) {
                        this.onAttackHero(heroModel, att);
                    }, this);
                    break;
                case "last":
                    var heroModel = _.last(allAlive);
                    this.onAttackHero(heroModel, att);
                    break;
                case "last2":
                    var heroes = _.last(allAlive,2);
                    _.each(heroes, function (heroModel) {
                        this.onAttackHero(heroModel, att);
                    }, this);
                    break;
                case "last3":
                    var heroes = _.last(allAlive,3);
                    _.each(heroes, function (heroModel) {
                        this.onAttackHero(heroModel, att);
                    }, this);
                    break;
                case "random":
                    var heroModel = _.sample(allAlive);
                    this.onAttackHero(heroModel, att);
                    break;
                case "all":
                    _.each(allAlive, function (heroModel) {
                        this.onAttackHero(heroModel, att);
                    }, this);
                    break;
            }
        }
    },
    onAttackHero:function(hero, att){
        if ( att > 0) {
            var hit = hero.onBeAttacked(att, this);
            if (hit) {
                var damageTaken = hero.onBeDamaged(att, this);
                if (damageTaken > 0) {
                    this.onDamageHero(hero, damageTaken);
                    if (hero.get("hp") == 0) {
                        this.trigger("kill-hero");
                        this.onKillHero(hero);
                    }
                    var attackLeft = att - damageTaken;
                    if (attackLeft > 0) {
                        this.onOverKillHero(hero, attackLeft);
                    }
                } else {
                    //totally blocked
                    this.trigger("blocked");
                    this.onBeBlocked(hero);
                }
            } else {
                //miss
                this.trigger("miss");
                this.onMiss(hero);
            }
        }
    },
    onBeBlocked:function(heroModel){
    },
    onMiss:function(heroModel){
    },
    onDamageHero:function(heroModel, damageTaken ){
    },
    onKillHero:function(heroModel){
    },
    onOverKillHero:function(heroModel, damageLeft ){
        if ( this.get("trample") && this.get("attackRange") !== "all" ) {
            this.onAttackTeam(window.gameModel.get("team"), damageLeft);
        }
    },
    onTeamPass:function(team){
    },
    onPay:function(cost){
    },
    onCantPay:function(cost){
    },
    getDescription:function(){
        var desc = DungeonCardModel.prototype.getDescription.call(this);
        var descs = [desc];
        switch ( this.get("attackRange") ) {
            case "first":
                descs.push( "{[attack-first]}:攻击排在队首的英雄" );
                break;
            case "first2":
                descs.push( "{[attack-first2]}:攻击排在队首的2个英雄" );
                break;
            case "first3":
                descs.push( "{[attack-first3]}:攻击排在队首的3个英雄" );
                break;
            case "last":
                descs.push( "{[attack-last]}:攻击排在队尾的英雄" );
                break;
            case "last2":
                descs.push( "{[attack-last2]}:攻击排在队尾的2个英雄" );
                break;
            case "last3":
                descs.push( "{[attack-last3]}:攻击排在队尾的3个英雄" );
                break;
            case "random":
                descs.push( "{[attack-random]}:随机攻击队伍中的1个英雄" );
                break;
            case "all":
                descs.push( "{[attack-all]}:攻击队伍中的所有英雄" );
                break;
        }

        if ( this.get("pierce") ) {
            descs.push( "{[pierce]}:攻击时无视英雄的防御" );
        }
        if ( this.get("trample") ) {
            descs.push( "{[trample]}:杀死英雄后多余的伤害转嫁到之后的英雄上" );
        }
        return descs.join("\n");
    }
})

var RatmanModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"ratman",
            displayName:"鼠人",
            attack: 0,
            baseAttack: 0,
            baseCost: 1,
            maxLevel: 5
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseUpgradeCost: level*level
        } );
        this.reEvaluate();
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        return desc+"翻开时，+"+this.getEffect()+"{[money]}";
    },
    getEffect:function(){
        return this.get("level");
    },
    onReveal:function(){
        MonsterModel.prototype.onReveal.call(this);
        var money = this.getEffect();
        gameModel.getMoney(money);
        this.trigger("give",{
            icon: "money"
        });
    }
})

var SkeletonModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"skeleton",
            displayName:"骷髅",
            subtype:"undead",
            attack: 1,
            baseAttack: 1,
            maxLevel: 5,
            baseCost: 1,
            baseUpgradeCost: 2
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    }
})

var OrcModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"orc",
            displayName:"兽人",
            maxLevel: 5,
            baseUpgradeCost: 2
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        var level = this.get("level");
        return desc+"兽人的攻击力等于本层地城中怪物的数量"+ (level>1?("+"+(level-1)):"");
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: "＊",
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    onStageReveal:function(dungeonCards){
        var att = _.reduce(dungeonCards, function(memo, cardModel){
            var value = 0;
            if ( cardModel.get("side") === "front" && cardModel instanceof MonsterModel ) {
                value = 1;
            }
            return memo+value;
        },0,this);
        this.set({
            baseAttack: att + this.get("level") - 1
        })
    }
})

var MinotaurModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"minotaur",
            displayName:"牛头人",
            maxLevel: 4,
            baseUpgradeCost: 2
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        var level = this.get("level");

        if ( level === 1 ) {
            return desc + "牛头人的攻击力等于地城深度";
        } else if ( level === 2 ) {
            return desc + "牛头人的攻击力等于地城深度+1";
        } else if ( level === 3 ) {
            return desc + "牛头人的攻击力等于地城深度的2倍";
        } else if ( level >= 4 ) {
            return desc + "牛头人的攻击力等于地城深度的3倍";
        }
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: "＊",
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    onStageReveal:function(dungeonCards){
        var stageNumber = window.gameModel.get("stageNumber") + 1; //翻开时英雄还未走下新的地城，所以数值要+1
        var level = this.get("level");
        var att = stageNumber;
        if ( level === 1 ) {
            att = stageNumber;
        } else if ( level === 2 ) {
            att = stageNumber+1;
        } else if ( level === 3 ) {
            att = stageNumber*2;
        } else if ( level >= 4 ) {
            att = stageNumber*3;
        }
        this.set({
            baseAttack: att
        })
    }
});

var OozeModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"ooze",
            displayName:"软泥怪",
            attack: 0,
            baseAttack: 0,
            maxLevel: 6,
            baseUpgradeCost: 2
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        var level = this.get("level");
        if ( level <= 3 )
            return desc + "经过的英雄-"+level+"{[defense]}";
        else
            return desc + "所有英雄-"+(level-3)+"{[defense]}";
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: 1,
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    onDamageHero:function(heroModel, damageTaken ){
        var level = this.get("level");
        if ( level <= 3 )
            heroModel.loseDefense(3);
    },
    onBeBlocked:function(heroModel){
        var level = this.get("level");
        if ( level <= 3 )
            heroModel.loseDefense(3);
    },
    onTeamPass:function(team){
        var level = this.get("level");
        if ( level >= 4) {
            _.each(team, function (heroModel) {
                if (heroModel.isAlive()) {
                    heroModel.loseDefense(level-3);
                }
            }, this);
        }
    }
});

var GhostModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"ghost",
            displayName:"鬼魂",
            subtype:"undead",
            maxLevel: 5,
            baseUpgradeCost: 2,
            baseCost: 5,
            attackRange: "random",
            pierce: true
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    }
});

var TitanModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"titan",
            displayName:"泰坦巨人",
            maxLevel: 5,
            baseUpgradeCost: 2,
            baseCost: 5,
            attackRange: "first",
            trample: true
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level*3,
            baseScore: level,
            baseUpgradeCost: level*5
        } );
        this.reEvaluate();
    }
});

var SpiderModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"spider",
            displayName:"毒蜘蛛",
            attack: 0,
            baseAttack: 0,
            maxLevel: 5,
            baseUpgradeCost: 2
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        return desc + "受伤的英雄中毒"+this.getEffect()+"轮";
    },
    getEffect:function(){
        return this.get("level")+1;
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: Math.ceil(level/2),
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    onDamageHero:function(heroModel, damageTaken ){
        heroModel.getPoison(this.getEffect());
    }
});