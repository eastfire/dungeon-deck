/**
 * Created by 赢潮 on 2015/2/25.
 */
var SpellModel = DungeonCardModel.extend({ //法术
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this),{
            type: "spell",
            target: null, // none, all-hero, random-hero, single-hero, single-dungeon, single-monster, single-room, , item, cardInDiscard, cardInDeck
            timing: null //
        })
    },
    onCast:function(options){
        options = options || {};
        switch ( this.get("target") ){
            case null: case "all-hero":
                this.onEffect();
            break;
            case "single-hero":
                this.trigger("please-choose-hero", _.extend(options,{
                    hint: texts.please_choose_target_hero_for_spell
                }));
                break;
            case "single-dungeon":
                this.trigger("please-choose-dungeon", _.extend(options,{
                    hint: texts.please_choose_target_dungeon_for_spell
                }));
                break;
            case "single-dungeon-monster":
                this.trigger("please-choose-dungeon", _.extend(options,{
                    hint: texts.please_choose_target_dungeon_for_spell,
                    filter:function(model){
                        return model.get("type") === "monster";
                    }
                }));
                break;
        }
    },
    onEffect:function(){
        this.trigger("cast-spell-finish",this);
    },
    onSelectTarget:function(heroModel){
        this.onEffect(heroModel);
    }
})

var MagicMissileModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"magic-missile",
            displayName:"魔导弹",
            target: "single-hero",
            baseCost: 1,
            baseAttack: 1,
            attack: 1,
            maxLevel:3
        })
    },
    initEvent:function(){
        SpellModel.prototype.initEvent.call(this);
        this.on("change:baseAttack change:attackBuff change:attackDebuff", this.evaluateAttack, this);
    },
    reEvaluate:function(){
        SpellModel.prototype.reEvaluate.call(this);
        this.evaluateAttack();
    },
    initByLevel:function(){
        var level = this.get("level");
        this.set({
            baseAttack: level,
            baseScore: level,
            baseUpgradeCost: level*2
        } );
        this.reEvaluate();
    },
    evaluateAttack:function(){
        this.set("attack", this.get("baseAttack"))
    },
    getEffect:function(level){
        return this.get("attack");
    },
    onEffect:function(heroModel){
        heroModel.onBeDamaged(this.getEffect(), this);
        SpellModel.prototype.onEffect.call(this);
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "选择1个英雄对其造成"+this.getEffect()+"点伤害"
    }
})

var LighteningModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"lightening",
            displayName:"闪电链",
            target: "all-hero",
            baseCost: 1,
            baseAttack: 1,
            attack: 1
        })
    },
    initialize:function(){
        SpellModel.prototype.initialize.call(this);
        this.on("change:baseAttack", this.evaluateAttack, this)
    },
    evaluateAttack:function(){
        this.set("attack", this.get("baseAttack"))
    },
    getEffect:function(level){
        return this.get("attack");
    },
    onEffect:function(){
        _.each( gameModel.get("team"),function(heroModel){
            heroModel.onBeDamaged(this.getEffect(), this);
        },this);
        SpellModel.prototype.onEffect.call(this);
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "对每个英雄造成"+this.getEffect()+"点伤害"
    }
})

var FireballModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"fireball",
            displayName:"火球术",
            target: "single-hero",
            baseCost: 1,
            baseAttack: 1,
            attack: 1
        })
    },
    initialize:function(){
        SpellModel.prototype.initialize.call(this);
        this.on("change:baseAttack", this.evaluateAttack, this)
    },
    evaluateAttack:function(){
        this.set("attack", this.get("baseAttack"))
    }
});

var WarDrumModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"war-drum",
            displayName:"战鼓",
            target: "single-dungeon-monster",
            baseCost: 1,
            baseAttack: 0,
            attack: 0
        })
    },
    getEffect:function(){
        return this.get("level");
    },
    onEffect:function(dungeonModel){
        dungeonModel.set("attackBuff", dungeonModel.get("attackBuff")+this.getEffect());
        SpellModel.prototype.onEffect.call(this);
    },
    getDescription:function(){
        var desc = RoomModel.prototype.getDescription.call(this);
        if ( desc !== "" ) {
            desc += "\n";
        }
        return desc + "使地城中的1个怪物攻击力+"+this.getEffect()
    }
});

//TODO 扰乱英雄顺序
//TODO 回到一层地城起点
//TODO 将尸体变成僵尸