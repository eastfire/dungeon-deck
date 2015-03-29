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
            attackType: "melee",
            attackRange: "first",
            status: null
        })
    },
    initialize:function(){
        DungeonCardModel.prototype.initialize.call(this);
        this.on("change:baseAttack", this.evaluateAttack, this)
    },
    evaluateAttack:function(){
        this.set("attack", this.get("baseAttack"))
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
    onGain:function(){
    },
    onExile:function(){
    },
    onPay:function(cost){
    },
    onCantPay:function(cost){
    }
})

var RatmanModel = MonsterModel.extend({
    defaults:function(){
        return _.extend(MonsterModel.prototype.defaults.call(this), {
            name:"ratman",
            displayName:"鼠人",
            attack: 0,
            baseAttack: 0
        })
    },
    getDescription:function(){
        return "翻开时，+"+this.getEffect()+"{[money]}";
    },
    getEffect:function(){
        return this.get("level");
    },
    onReveal:function(){
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
            baseAttack: 1
        })
    }
})