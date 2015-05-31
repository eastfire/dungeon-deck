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

            level: 1,
            maxLevel: 3,
            positionInTeam: null,

            poison: 0,
            slow: 0,

            poisonReduce: 1,
            poisonResistance: 0,
            slowReduce: 1,
            slowResistance: 1
        }
    },
    initialize:function(){
        this.__joinTeamOver = false;
        this.evaluateMaxHp();
        this.evaluateScore();
        this.evaluateDefense();
        this.set("hp",this.get("maxHp"), {silent:true});

        this.__initEvent();
    },
    __initEvent:function(){
        this.on("change:level",this.onChangeLevel,this);
        this.on("change:baseScore", this.evaluateScore, this);
        this.on("change:baseMaxHp", this.evaluateMaxHp, this);
        this.on("change:baseDefense", this.evaluateDefense, this);
    },
    onChangeLevel:function(){
        this.set({
            baseScore: this.get("level"),
            baseMaxHp:this.get("baseMaxHp") + (this.get("level") - this.previous("level") ),
            baseDefense: this.get("level") - 1
        });
    },
    evaluateScore:function(){
        this.set("score", this.get("baseScore"))
    },
    evaluateMaxHp:function(){
        this.set("maxHp", this.get("baseMaxHp"));
    },
    evaluateDefense:function(){
        this.set("defense", this.get("baseDefense"));
    },
    getDescription:function(){
        var desc = [];
        if ( this.get("score") ) {
            desc.push( "{[score]}杀死该英雄将得到"+this.get("score")+"分");
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
        return desc.join("\n");
    },
    startJoinTeam:function(){
        this.__joinTeamOver = false;
    },
    isJoinTeamEnd:function(){
        return this.__joinTeamOver;
    },
    isAlive:function(){
        return this.get("hp") > 0;
    },
    onJoinTeam:function(){
        this.__joinTeamOver = true;
        this.trigger("joinTeamEnd");
    },
    onPositionInTeamChange:function(){
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
        var recovery = gameModel.getTavernRecoveryEffect(diff);
        if ( recovery > 0 ) {
            this.set("hp",hp+recovery);
            this.trigger("give",{
                icon: "money"
            });
            gameModel.getPayFromTavern(recovery);
        }
    },
    resetToOrigin:function(){
        this.set({
            slow:0,
            poison: 0,
            buff:0,
            debuff:0
        });
    },
    onEnterStage:function(){
    },
    onEnterRoom:function(roomModel){
    },
    onPassRoom:function(roomModel){
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
    getPoison:function(amount){
        this.set("poison",this.get("poison")+amount);
    },
    getSlow:function(amount){
        this.set("slow",this.get("slow")+amount);
    },
    onPassStage:function(){
    },
    onBeAttacked:function(damage,monsterModel){
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
        if ( this.get("hp") <= 0 ) {
            this.onDie();
        }
        return d;
    },
    getHeal:function(heal){
        var currentHp = this.get("hp");
        this.set("hp", currentHp + heal);
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
        window.gameModel.getScore( this.get("score"));
        window.gameModel.getExp( this.get("level") );
        this.trigger("die");
    }
})

var WarriorModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"warrior",
            displayName:"战士",
            hp:12,
            baseMaxHp: 12,
            maxLevel: 4,
            baseDefense: 0
        })
    }
    //TODO onJoinTeam override
})

var HERO_CLASS_MAP = {
    warrior : WarriorModel
}
