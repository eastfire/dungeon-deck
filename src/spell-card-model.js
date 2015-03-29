/**
 * Created by 赢潮 on 2015/2/25.
 */

var MagicMissileModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"magic-missile",
            displayName:"魔导弹",
            target: "hero",
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
})

var LighteningModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"lightening",
            displayName:"闪电链",
            target: "team",
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
})

var FireballModel = SpellModel.extend({
    defaults:function(){
        return _.extend(SpellModel.prototype.defaults.call(this), {
            name:"fireball",
            displayName:"火球术",
            target: "hero",
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
})