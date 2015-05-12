/**
 * Created by 赢潮 on 2015/4/11.
 */
var LevelUpLayer = cc.Layer.extend({
    ctor:function(options){
        this._super();
        this.options = options || {};

        var levelUps = this.generateAvailableLevelUp();
        this.renderLevelUp(levelUps);
    },
    generateAvailableLevelUp:function(){

    },
    renderLevelUp:function(){

    }
})

var LevelUpScene = cc.Scene.extend({
    ctor:function(options){
        this._super();
        this.options = options || {};
    },
    onEnter:function (options) {
        this._super();
        var layer = new LevelUpLayer(this.options);
        this.addChild(layer);
        var uiLayer = new UILayer({model:window.gameModel});
        this.addChild(uiLayer,100);
    }
});

//TODO hp max up
//TODO magic max up
//TODO card number up
//TODO card max level up
//TODO add choice count
//TODO reduce exp require
//TODO add tavern fee
//TODO reduce recovery of hero
//TODO reduce buy trap cost
//TODO reduce buy monster cost
//TODO reduce buy spell cost
//TODO reduce upgrade trap cost
//TODO reduce upgrade monster cost
//TODO reduce upgrade spell cost
//TODO reduce hero attack heart