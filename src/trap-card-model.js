var TrapModel = DungeonCardModel.extend({ //房间
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this),{
            type: "trap",
            attackBuff: 0,
            attackDebuff : 0
        })
    },
    onTeamEnter:function(team){
        this.onAttackTeam(team);
    },
    onTeamPass:function(team){
    },
    onMiss:function(heroModel){
    },
    onDamageHero:function(heroModel, damageTaken ){
    },
    onBeBlocked:function(heroModel){
    },
    onKillHero:function(heroModel){
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
    onAttackTeam:function(team, damageLeft){
        var att = damageLeft || this.get("attack");
        //find all alive hero
        var allAlive = _.filter( team ,function(model){
            return model.isAlive();
        }, this );
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
        if ( att > 0 ) {
            var hit = hero.onBeAttacked(att, this);
            if (hit) {
                var damageTaken = hero.onBeDamaged(att, this);
                if (damageTaken > 0) {
                    this.onDamageHero(hero, damageTaken);
                    if (hero.get("hp") == 0) {
                        this.trigger("kill-hero");
                        this.onKillHero(hero);
                    }
//                var attackLeft = att - damageTaken;
//                if ( attackLeft > 0 ) {
//                    this.onOverKillHero( hero, attackLeft );
//                }
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
    getDescription:function(){
        var desc = DungeonCardModel.prototype.getDescription.call(this);
        var descs = [desc];
        switch ( this.get("attackRange") ) {
            case "first":
                descs.push( "{[attack-first]}:影响排在队首的英雄" );
                break;
            case "first2":
                descs.push( "{[attack-first2]}:影响排在队首的2个英雄" );
                break;
            case "first3":
                descs.push( "{[attack-first3]}:影响排在队首的3个英雄" );
                break;
            case "last":
                descs.push( "{[attack-last]}:影响排在队尾的英雄" );
                break;
            case "last2":
                descs.push( "{[attack-last2]}:影响排在队尾的2个英雄" );
                break;
            case "last3":
                descs.push( "{[attack-last3]}:影响排在队尾的3个英雄" );
                break;
            case "random":
                descs.push( "{[attack-random]}:随机影响队伍中的1个英雄" );
                break;
            case "all":
                descs.push( "{[attack-all]}:影响队伍中的所有英雄" );
                break;
        }
        return descs.join("\n");
    }
});

var ArrowTrapModel = TrapModel.extend({
    defaults:function(){
        return _.extend( TrapModel.prototype.defaults.call(this),{
            name: "arrow-trap",
            displayName:"飞箭陷阱",
            attackRange:"last",
            baseCost: 4,
            maxLevel: 5
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: level*4+3,
            payMoney: 1
        } );
        this.reEvaluate();
    }
});

var PitfallModel = TrapModel.extend({
    defaults:function(){
        return _.extend( TrapModel.prototype.defaults.call(this),{
            name: "pitfall",
            displayName:"陷坑",
            attackRange:"first",
            baseCost: 3,
            maxLevel: 4
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: "*",
            baseScore: level,
            baseUpgradeCost: level,
            payMoney: level - 1
        } );
        if ( level == 1 ) {
            this.set("attackRange","first");
        } else if ( level == 2 ) {
            this.set("attackRange","first2");
        } else if ( level == 3 ) {
            this.set("attackRange","first3");
        } else if ( level >= 4 ) {
            this.set("attackRange","all");
        }
        this.reEvaluate();
    },
    onAttackHero:function(hero, att){
        att = hero.get("defense");
        if ( att > 0 ) {
            var hit = hero.onBeAttacked(att, this);
            if (hit) {
                var damageTaken = hero.onBeDamaged(att, this);
                if (damageTaken > 0) {
                    this.onDamageHero(hero, damageTaken);
                    if (hero.get("hp") == 0) {
                        this.trigger("kill-hero");
                        this.onKillHero(hero);
                    }
//                var attackLeft = att - damageTaken;
//                if ( attackLeft > 0 ) {
//                    this.onOverKillHero( hero, attackLeft );
//                }
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
    getDescription:function(){
        var desc = TrapModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        desc += "英雄受到等于其{[defense]}的伤害";
        return desc;
    }
})

var PoisonGasModel = TrapModel.extend({
    defaults:function(){
        return _.extend( TrapModel.prototype.defaults.call(this),{
            name: "poison-gas",
            displayName:"毒气陷阱",
            attackRange:"first",
            baseCost: 5,
            maxLevel: 6
        })
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: 0,
            baseScore: level,
            baseUpgradeCost: level + 1,
            payMoney: level
        } );
        if ( level == 1 ) {
            this.set("attackRange","first");
        } else if ( level <= 3 && level >= 2 ) {
            this.set("attackRange","first2");
        } else if ( level <= 5 && level >= 4 ) {
            this.set("attackRange","first3");
        } else if ( level >= 6 ) {
            this.set("attackRange","all");
        }
        this.reEvaluate();
    },
    getEffect:function(level){
        level = level || this.get("level");
        return Math.floor((level+1)/2)+1;
    },
    onAttackHero:function(heroModel, att){
        var hit = heroModel.onBeAttacked(0, this);
        if (hit) {
            heroModel.getPoison(this.getEffect());
        }
    },
    getDescription:function(){
        var desc = TrapModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        desc += "英雄中毒"+this.getEffect()+"轮";
        return desc;
    }
})

var RollingBoulderModel = TrapModel.extend({
    defaults:function(){
        return _.extend( TrapModel.prototype.defaults.call(this),{
            name: "rolling-boulder",
            displayName:"滚石陷阱",
            attackRange:"last",
            maxLevel: 5,
            baseCost: 5
        })
    },
    onAttackHero:function(heroModel, att){
        var hit = heroModel.onBeAttacked(0, this);
        if (hit) {
            heroModel.set("hp",0);
        }
    },
    getDescription:function(){
        var desc = TrapModel.prototype.getDescription.call(this);
        if ( desc != "" ) {
            desc += "\n";
        }
        desc += "受影响的英雄立即死亡";
        return desc;
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: "*",
            baseUpgradeCost: level*10+10,
            payMoney: 6-level
        } );
        this.reEvaluate();
    }
});