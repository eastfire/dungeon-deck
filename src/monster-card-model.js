/**
 * Created by 赢潮 on 2015/2/25.
 */
var MonsterModel = DungeonCardModel.extend({ //怪物牌
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this), {
            type: "monster",
            subType: "",
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
        if ( isValidInt( this.get("baseAttack") ) ) {
            this.set("attack", this.get("baseAttack"));
        } else {
            this.set("attack", this.get("baseAttack") + this.get("attackBuff") - this.get("attackDebuff"));
        }
    },
    onStageReveal:function(dungeonCards){
        this.evaluateAttack();
    },
    onTeamEnter:function(team){
    },
    onAttackTeam:function(team){
        var att = this.get("attack");
        //find all alive hero
        var allAlive = _.filter( team ,function(model){
            return model.isAlive();
        }, this )
        switch ( this.get("attackRange") ) {
            case "first":
                var hero = _.first(allAlive);
                this.onAttackHero(hero, att);
                break;
            case "last":
                var hero = _.last(allAlive);
                this.onAttackHero(hero, att);
                break;
            case "random":
                var hero = _.sample(allAlive);
                this.onAttackHero(hero, att);
                break;
            case "all":
                _.each(allAlive,function(heroModel){
                    this.onAttackHero(hero, att);
                },this);
                break;
        }
    },
    onAttackHero:function(hero, att){
        var hit = hero.onBeAttacked(att, this );
        if ( hit ) {
            var damageTaken = hero.onBeDamaged(att, this);
            if ( damageTaken > 0 ) {
                this.onDamageHero( hero, damageTaken );
                if ( hero.get("hp") == 0 ) {
                    this.trigger("kill-hero");
                    this.onKillHero(hero);
                }
                var attackLeft = att - damageTaken;
                if ( attackLeft > 0 ) {
                    this.onOverKillHero( hero, attackLeft );
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
    },
    onBeBlocked:function(heroModel){
    },
    onMiss:function(heroModel){
    },
    onDamageHero:function(heroModel, damageTaken ){
    },
    onKillHero:function(heroModel){
    },
    onOverKillHero:function(heroModel, attLeft ){
    },
    onTeamPass:function(team){
    },
    onPay:function(cost){
    },
    onCantPay:function(cost){
    },
    getDescription:function(){
        var desc = DungeonCardModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        switch ( this.get("attackRange") ) {
            case "first":
                desc += "{[attack-first]}:攻击队首的英雄"
                break;
            case "last":
                desc += "{[attack-last]}:攻击队尾的英雄"
                break;
            case "random":
                desc += "{[attack-random]}:随机攻击队伍中的1个英雄"
                break;
            case "all":
                desc += "{[attack-all]}:攻击队伍中的所有英雄"
                break;
        }

        return desc;
    }
})

var RatmanModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"ratman",
            displayName:"鼠人",
            attack: 0,
            baseAttack: 0,
            maxLevel: 1
        })
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
            attack: 1,
            baseAttack: 1,
            maxLevel: 5,
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
            attack: "?",
            baseAttack: "?",
            maxLevel: 5,
            baseUpgradeCost: 2
        })
    },
    getDescription:function(){
        var desc = MonsterModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        var level = this.get("level");
        return desc+"兽人的攻击力等于本层地城中怪物的数量"+ (level>1?("+"+(level-1)):"");
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: "?",
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
            attack: "?",
            baseAttack: "?",
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
            baseAttack: "?",
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    onStageReveal:function(dungeonCards){
        var stageNumber = window.gameModel.get("stageNumber") + 1; //翻开时英雄还未走下新的地城，所以数值要+1
        var att = stageNumber;
        if ( stageNumber === 1 ) {
            att = stageNumber;
        } else if ( stageNumber === 2 ) {
            att = stageNumber+1;
        } else if ( stageNumber === 3 ) {
            att = stageNumber*2;
        } else if ( stageNumber >= 4 ) {
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
        if ( level <= 3 )
            return desc + "被攻击后的英雄-"+level+"{[defense]}";
        else
            return desc + "被攻击后所有英雄-"+(level-3)+"{[defense]}";
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