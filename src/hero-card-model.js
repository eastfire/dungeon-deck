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
            level: 1,
            status: "",
            positionInTeam: null
        }
    },
    initialize:function(){
        this.__joinTeamOver = false;
        this.evaluateMaxHp();
        this.evaluateScore();
        this.set("hp",this.get("maxHp"), {silent:true});

        this.__initEvent();
    },
    __initEvent:function(){
        this.on("change:baseScore change:level", this.evaluateScore, this);
        this.on("change:baseMaxHp change:level", this.evaluateMaxHp, this);
    },
    evaluateScore:function(){
        this.set("score", this.get("baseScore")+this.get("level")-1)
    },
    evaluateMaxHp:function(){
        this.set("maxHp", this.get("baseMaxHp")+this.get("level")-1);
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
        this.set("level", level+1);

        var hp = this.get("hp");
        var maxHp = this.get("maxHp");
        var diff = Math.max(0, maxHp - hp);
        this.set("hp",maxHp);
        gameModel.getMoney(diff);
    },
    resetToOrigin:function(){
        this.set("status","");
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
    onBeDamaged:function(damage, monsterModel){
        var currentHp = this.get("hp");
        var d = Math.min( currentHp , damage );
        this.set("hp", currentHp - damage);
        if ( this.get("hp") === 0 ) {
            this.onDie();
        }
        return d;
    },
    getHeal:function(heal){
        var currentHp = this.get("hp");
        this.set("hp", currentHp + heal);
    },
    getAttackHeartPower:function(){
        return this.get("level")
    },
    onAttackHeart:function(damange){
    },
    onDie:function(){
        window.gameModel.getScore( this.get("score"));
        window.gameModel.getExp( this.get("level") );
    }
})

var WarriorModel = HeroModel.extend({
    defaults:function(){
        return _.extend(HeroModel.prototype.defaults.call(this), {
            name:"warrior",
            displayName:"战士",
            hp:4,
            baseMaxHp: 4
        })
    }
    //TODO onJoinTeam override
})

var HERO_CLASS_MAP = {
    warrior : WarriorModel
}
