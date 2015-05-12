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
            status: "",
            positionInTeam: null
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
            status:"",
            buff:0,
            debuff:0
        });
    },
    onEnterStage:function(){
    },
    onEnterRoom:function(roomModel){
    },
    onPassRoom:function(roomModel){
    },
    onPassStage:function(){
    },
    onBeAttacked:function(damage,monsterModel){
        return true;
    },
    onBeDamaged:function(damage, cardModel){
        var currentHp = this.get("hp");
        var damageAfterBlock = Math.max( damage - this.get("defense"), 0 );

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
            hp:6,
            baseMaxHp: 6,
            maxLevel: 2,
            baseDefense: 0
        })
    }
    //TODO onJoinTeam override
})

var HERO_CLASS_MAP = {
    warrior : WarriorModel
}
