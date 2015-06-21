/**
 * Created by 赢潮 on 2015/2/1.
 */
var INTRO_TITLE_FONT_SIZE = 42;
var GAME_TITLE_TEXT = "地城DBG"
var START_GAME_TEXT = "开始游戏"

var IntroLayer = cc.Layer.extend({
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.texture_plist);
        var size = cc.winSize;

        var coverBackground = new cc.Sprite(res.intro_jpg);
        //center
        coverBackground.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(coverBackground, 0);

        var titleLabel = new cc.LabelTTF(GAME_TITLE_TEXT, "宋体", INTRO_TITLE_FONT_SIZE);
        // position the label on the center of the screen
        titleLabel.attr({
            color: cc.color(0,0,0,255),
            x: size.width / 2,
            y: 415
        })
        // add the label as a child to this layer
        this.addChild(titleLabel, 1);

        // Create the text button
        var textButton = new ccui.Button();
        textButton.setTouchEnabled(true);
        textButton.loadTextures("backtotopnormal.png", "backtotoppressed.png", "", ccui.Widget.PLIST_TEXTURE);
        textButton.setTitleText(START_GAME_TEXT);
        textButton.setTitleColor(cc.color(0,0,0,255))
        textButton.attr({
            x: size.width/2,
            y: 90,
            anchorX: 0.5,
            anchorY: 0.5
        })

        textButton.addTouchEventListener(function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    break;
                case ccui.Widget.TOUCH_MOVED:
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    cc.director.runScene(new MainGameScene());
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    break;
                default:
                    break;
            }
        } ,this);
        this.addChild(textButton);

      /*  var startItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("start_game_default.png"),
            cc.spriteFrameCache.getSpriteFrame("start_game_selected.png"),
            function () {
                cc.director.runScene(new MainGameScene());
            }, this);
        startItem.attr({
            x: size.width/2,
            y: 70,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = new cc.Menu(startItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 2);*/
    }
});



var IntroScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new IntroLayer();
        this.addChild(layer);
    }
});