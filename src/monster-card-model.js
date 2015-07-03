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
                var result = hero.onBeDamaged(att, this);
                var damageTaken = result[0];

                if (damageTaken > 0) {
                    this.onDamageHero(hero, damageTaken);
                    if (hero.get("hp") == 0) {
                        this.trigger("kill-hero");
                        this.onKillHero(hero);
                        var attackLeft = result[1];
                        if (attackLeft > 0) {
                            this.onOverKillHero(hero, attackLeft);
                        }
                    }
                } else {
                    //totally blocked
                    hero.trigger("blocked");
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
});

var BasiliskModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"basilisk",
            displayName:"巨蟒",
            maxLevel: 5,
            attackRange: "last",
            baseCost: 6
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level+1,
            baseScore: level,
            baseUpgradeCost: level === 1 ? 9 : 4*level+2,
            trample: level >= 2
        } );
        this.reEvaluate();
    },
    maxLevelBonus:function(){
        this.set("baseScore",this.get("baseScore")+2);
    }
});

var DarkElfModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"dark-elf",
            displayName:"暗精灵",
            maxLevel: 5,
            baseCost: 2,
            attackRange: "last"
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: 4*(level-1)+2
        } );
        this.reEvaluate();
    },
    maxLevelBonus:function(){
        this.set("baseScore",this.get("baseScore")+2);
    }
})

var DragonModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"dragon",
            displayName:"龙",
            maxLevel: 5,
            baseCost: 16
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level+4,
            baseScore: 0,
            baseUpgradeCost: 18+level,
            payHp: level > 3 ? 2 : 3,
            trample: level > 3
        } );
        this.reEvaluate();
    }
})

var GhostModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"ghost",
            displayName:"鬼魂",
            subtype:"undead",
            maxLevel: 5,
            baseCost: 3,
            attackRange: "random",
            pierce: true
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level*2-1,
            baseUpgradeCost: level*4-1
        } );
        this.reEvaluate();
    },
    maxLevelBonus:function(){
        this.set("baseScore",this.get("baseScore")+2);
    }
});

var GargoyleModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"gargoyle",
            displayName:"石像鬼",
            baseCost: 5,
            maxLevel: 5
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        return desc + "封印英雄的主动技能"+this.getEffect()+"轮";
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: Math.floor(level/3)+1,
            baseScore: level,
            baseUpgradeCost: Math.ceil(level*4.5)
        } );
        this.reEvaluate();
    },
    getEffect:function(){
        return Math.floor(this.get("level")/2)+1;
    },
    onDamageHero:function(heroModel, damageTaken ){
        heroModel.getSilent(this.getEffect());
    },
    onBeBlocked:function(heroModel){
        heroModel.getSilent(this.getEffect());
    }
});

var LichModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"lich",
            displayName:"巫妖",
            baseCost: 5,
            maxLevel: 5
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        return desc + "杀死的英雄变成僵尸";
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: Math.ceil(level*2.5)
        } );
        this.reEvaluate();
    },
    onAttackHero:function(hero, att){
        hero.set("bite",true);
        MonsterModel.prototype.onAttackHero.call(this,hero,att);
    }
});

var LilithModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"lilith",
            displayName:"莉莉丝",
            baseCost: 5,
            maxLevel: 5
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc+"获得与英雄受到的伤害等量的{[black-hp]}";
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level>4?2:0,
            baseUpgradeCost: level*5+5
        } );
        this.reEvaluate();
    },
    onDamageHero:function(heroModel, damageTaken){
        if ( damageTaken ) {
            gameModel.getHp(damageTaken);
            this.trigger("give", {
                icon: "black-hp"
            });
        }
    }
});

var MinotaurModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"minotaur",
            displayName:"牛头人",
            baseCost: 4,
            maxLevel: 4
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
            return desc + "牛头人的攻击力等于地城深度的2倍+1";
        } else if ( level >= 5 ) {
            return desc + "牛头人的攻击力等于地城深度的3倍";
        }
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: "＊",
            baseScore: level,
            baseUpgradeCost: level*6
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
            att = stageNumber*2+1;
        } else if ( level >= 5 ) {
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
            baseCost: 4,
            maxLevel: 6
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
            heroModel.loseDefense(level);
    },
    onBeBlocked:function(heroModel){
        var level = this.get("level");
        if ( level <= 3 )
            heroModel.loseDefense(level);
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

var OrcModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"orc",
            displayName:"兽人",
            maxLevel: 5,
            baseCost: 7
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
            baseUpgradeCost: Math.ceil(level*3.5)+4
        } );
        this.reEvaluate();
    },
    onStageReveal:function(dungeonCards){
        var att = _.reduce(dungeonCards, function(memo, cardModel){
            if ( cardModel.isEffecting() && cardModel instanceof MonsterModel ) {
                return memo + 1;
            } else {
                return memo;
            }
        },0,this);
        this.set({
            baseAttack: att + this.get("level") - 1
        })
    }
});

var OrcBanditModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"orc-bandit",
            displayName:"兽人强盗",
            baseCost: 3,
            maxLevel: 5
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc+"获得与英雄受到的伤害等量的{[money]}";
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: 6*level+6
        } );
        this.reEvaluate();
    },
    onDamageHero:function(heroModel, damageTaken){
        if ( damageTaken ) {
            gameModel.getMoney(damageTaken);
            this.trigger("give", {
                icon: "money"
            });
        }
    }
});

var OrcWarlordModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"orc-warlord",
            displayName:"兽人酋长",
            baseCost: 9,
            maxLevel: 5
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc+"本层其他怪物+"+this.getEffect()+"{[attack]}";
    },
    getEffect:function(){
        return Math.ceil(this.get("level")/5);
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: Math.ceil(this.get("level")/2),
            baseScore: level*2,
            baseUpgradeCost: level*6+7
        } );
        this.reEvaluate();
    },
    onStageReveal:function(dungeonCards){
        _.each(dungeonCards, function(cardModel){
            if ( cardModel.isEffecting() && cardModel instanceof MonsterModel ) {
                if ( cardModel !== this ) {
                    cardModel.set("attackBuff",cardModel.get("attackBuff")+this.getEffect());
                }
            }
        },this);
    }
});

var RatmanModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"ratman",
            displayName:"鼠人",
            baseCost: 1,
            maxLevel: 5
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: 0,
            baseScore: level,
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
});

var SkeletonModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"skeleton",
            displayName:"骷髅",
            subtype:"undead",
            maxLevel: 5,
            baseCost: 1
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: 4*(level-1)+2
        } );
        this.reEvaluate();
    },
    maxLevelBonus:function(){
        this.set("baseScore",this.get("baseScore")+2);
    }
});

var SpiderModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"spider",
            displayName:"毒蜘蛛",
            baseCost: 4,
            maxLevel: 5
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

var TitanModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"titan",
            displayName:"泰坦巨人",
            maxLevel: 5,
            baseCost: 12
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level*2+1,
            baseScore: 0,
            baseUpgradeCost: level === 1 ? 12 : level*4+5,
            trample: level > 1
        } );
        this.reEvaluate();
    }
});

var TreefolkModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"treefolk",
            displayName:"树妖",
            baseCost: 8,
            maxLevel: 5
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        var scores = [0,1,2,4,6];
        this.set({
            baseAttack: Math.floor(level/2)+1,
            baseScore: scores[level-1],
            baseUpgradeCost: level != 1 ? 7 : 2
        } );
        this.reEvaluate();
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        return desc+"翻开时，+"+this.getEffect()+"{[black-hp]}";
    },
    getEffect:function(){
        return Math.ceil(this.get("level")/2);
    },
    onReveal:function(){
        MonsterModel.prototype.onReveal.call(this);
        var hp = this.getEffect();
        gameModel.getHp(hp);
        this.trigger("give",{
            icon: "black-hp"
        });
    }
});

var ZombieModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"zombie",
            displayName:"僵尸",
            subtype:"undead",
            maxLevel: 5,
            baseCost: 1
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: 4*(level-1)+2
        } );
        this.reEvaluate();
    }
});