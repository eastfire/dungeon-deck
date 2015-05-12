/**
 * Created by 赢潮 on 2015/4/4.
 */
var ChooseHeroLayer = cc.LayerColor.extend({
    ctor: function (options) {
        this._super(cc.color.BLACK);
        options = options || {};
        this.hint = options.hint;
        var source = options.sourceCardSprite;
        this.filter = options.filter || function(){ return true };
        this.gameModel = options.gameModel;
        this.onCancelCallback = options.onCancelCallback;
        this.onCancelContext = options.onCancelContext;
        this.onSelectCallback = options.onSelectCallback;
        this.onSelectContext = options.onSelectContext;

        this.__renderHero();
        this.__renderSource(source);
        this.__initEvent();
        this.__renderHint(this.hint);
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
                self.onCancelCallback.call(self.onCancelContext);
                self.close.call(self);
            }
        }), this);
    },
    onExit:function(){
        cc.eventManager.removeListener(this.touchListener);
    },
    close:function(){
        window.mainGame.resumeAction();
        this.removeAllChildren(true);
        this.removeFromParent(true);
    },
    __renderHint:function(hint){
        var hintLabel = buildRichText({
            text: hint,
            fontSize: 35,
            fontColor: cc.color.WHITE,
            width: 540,
            height: 60
        })
        hintLabel.attr({
            x: dimens.choose_hero_hint_position.x,
            y: dimens.choose_hero_hint_position.y,
            anchorX : 0.5,
            anchorY : 0.5
        })
        this.addChild(hintLabel);
    },
    __renderHero:function(){
        var items = [];
        var team = this.gameModel.get("team")
        var heroNumber = team.length;
        if ( heroNumber <= 0 ) {
            this.hint = texts.no_valid_target;
            return;
        }
        var widthUnit = cc.winSize.width / heroNumber;
        var x = widthUnit/2;
        var y = dimens.team_position.y;
        var self = this;
        var validCount = 0;
        _.each (team , function(heroModel){
            if ( !heroModel.get("exiled") ) {
                var card = new HeroCardSprite({ model: heroModel, side: heroModel.isAlive() ? "front" : "back"});
                card.attr({
                    x: x,
                    y: y
                })
                this.addChild(card);

                if (!heroModel.isAlive() || !this.filter(heroModel)) {
                    card.opacity = dimens.cant_choose_opacity;
                    x += widthUnit;
                    return;
                }

                validCount++;
                cc.eventManager.addListener(cc.EventListener.create({
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: true,
                    onTouchBegan: function (touch, event) {
                        var target = event.getCurrentTarget();

                        var locationInNode = target.convertToNodeSpace(touch.getLocation());
                        var s = target.getContentSize();
                        var rect = cc.rect(0, 0, s.width, s.height);

                        if (cc.rectContainsPoint(rect, locationInNode)) {
                            return true;
                        }
                        return false;
                    },
                    onTouchMoved: function (touch, event) {
                    },
                    onTouchEnded: function (touch, event) {
                        var target = event.getCurrentTarget();
                        self.close();
                        self.onSelectCallback.call(self.onSelectContext, heroModel);
                    }
                }), card);

                var selectItem = new cc.MenuItemImage(
                    cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
                    cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
                    function () {
                        this.close();
                        this.onSelectCallback.call(this.onSelectContext, heroModel);
                    }, this);
                selectItem.attr({
                    x: x - 2,
                    y: y - dimens.card_height / 2 - 43,
                    anchorX: 0.5,
                    anchorY: 0.5,
                    scaleX: 0.7,
                    scaleY: 0.8
                });
                var text = new cc.LabelTTF(texts.select, "Arial", dimens.buy_font_size);
                text.attr({
                    color: colors.buy,
                    x: x,
                    y: y - dimens.card_height / 2 - 48
                });
                this.addChild(text, 1);

                items.push(selectItem);

            } else {

            }
            x += widthUnit;
        },this);

        var selectMenu = new cc.Menu(items);
        selectMenu.x = 0;
        selectMenu.y = 0;
        this.addChild(selectMenu);

        if ( !validCount ) {
            this.hint = texts.no_valid_target;
        }
    },
    __renderSource:function(source){
        if ( source ) {
            var sourceModel = source.model;
            var card = new DUNGEON_SPRITE_CLASS_MAP[sourceModel.get("name")]({
                model: sourceModel
            });
            card.attr({
                x: source.x,
                y: source.y
            });
            this.addChild(card);
        }
    }
});