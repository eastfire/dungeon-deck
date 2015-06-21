/**
 * Created by 赢潮 on 2015/5/1.
 */
var showUpgrade = function(options){
    var range = ["discard"];
    var rangeText = "弃牌堆中"
    if ( gameModel.get("upgradeRangeLevel") === UPGRADE_RANGE_LEVEL.FROM_DECK ) {
        range.push("deck");
        rangeText = "弃牌堆及牌堆中的"
    }
    cc.director.pushScene(new ChooseCardScene({
        model: gameModel,
        range: range,
        validText: texts.level_up,
        hint: function(){
            var chance = gameModel.get("upgradeChance");
            return chance > 0 ? ("你可以升级"+chance+"次"+rangeText+"卡牌") : "升级地城之心以获得升级卡牌的机会";
        },
        visibleFilter:function(cardModel){
            return cardModel.get("upgradeable");
        },
        validFilter:function(cardModel){
            return gameModel.get("upgradeChance") > 0
                && cardModel.get("level") < cardModel.get("maxLevel")
                && gameModel.get("money") >= cardModel.get("upgradeCost");
        },
        invalidText:function(cardModel){
            if ( gameModel.get("upgradeChance") === 0 ) return null;
            if ( cardModel.get("level") >= cardModel.get("maxLevel") ) return texts.max_level;
            return null;
        },
        appendIcon:function(cardModel){
            if ( cardModel.get("level") >= cardModel.get("maxLevel") ) return null;
            var cost = cardModel.get("upgradeCost");
            var icon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("money-icon.png"),
                text: cost,
                fontSize: dimens.buyable_deck_count_font_size,
                offset: {
                    x: dimens.hero_icon_size.width / 2 - 1,
                    y: dimens.hero_icon_size.height / 2 - 5
                }
            });
            icon.attr({
                x: dimens.hero_icon_offset.x,
                y: dimens.hero_icon_offset.y
            })
            return icon;
        },
        onSelectCallback:function(cardModel, chooseCardLayer){
            var cost = cardModel.get("upgradeCost");
            if (cost <= gameModel.get("money")) {
                var targetLevel = cardModel.get("level") + 1;
                var upgradeVersionModel = new DUNGEON_CLASS_MAP[cardModel.get("name")]({
                    level: targetLevel
                });
                var self = this;
                window.mainGame.pauseAction();
                var layer = new CardDetailLayer({model:upgradeVersionModel,
                    hint: "支付"+cardModel.get("upgradeCost")+"{[money]}将"+cardModel.get("displayName")+"升到"+targetLevel+"级？",
                    choices:[{
                        text: texts.level_up,
                        callback: function(){
                            gameModel.useMoney(cardModel.get("upgradeCost"));
                            cardModel.levelUp();
                            gameModel.set("upgradeChance", gameModel.get("upgradeChance")-1);
                            chooseCardLayer.__renderAll();
                            layer.close();
                        },
                        context: this,
                        textOffset: {
                            x: 150,
                            y: 8
                        }
                    },{
                        text: texts.cancel,
                        callback: function(){
                            layer.close();
                        },
                        context: this,
                        textOffset: {
                            x: 150,
                            y: 8
                        }
                    }]});
                chooseCardLayer.addChild(layer, 300);
            }
        },
        onSelectContext:this
    }));
}