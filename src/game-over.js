/**
 * Created by 赢潮 on 2015/4/28.
 */
var GameOverLayer = cc.LayerColor.extend({
    ctor: function (options) {
        options = options || {};
        this.model = options.model;

        this._super(colors.card_detail_mask);
    }
});

var GameOverScene = cc.Scene.extend({
    ctor:function(options){
        this._super();
        this.options = options || {};
    },
    onEnter:function (options) {
        this._super();
        var layer = new GameOverLayer({model:this.options.model});
        this.addChild(layer);
    }
});