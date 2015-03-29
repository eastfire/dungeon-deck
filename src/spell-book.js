/**
 * Created by 赢潮 on 2015/3/28.
 */

var SpellBookLayer = cc.Layer.extend({
    ctor:function(options){
        this._super();

        this.model = options.model;

        var bg = new cc.Sprite(res.book_bg_png);
        bg.attr({
            x:320,
            y:0,
            anchorY:0
        });
        this.addChild(bg,1);

        this.__initEvent();
    },
    __initEvent:function(){
        var self = this;
        cc.eventManager.addListener(this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                //cc.director.popScene();
                if ( this.fromTop )
                    mainGame.resumeAction();
                self.removeFromParent(true);
            }
        }), this);
    }
});
