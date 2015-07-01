/**
 * Created by 赢潮 on 2015/4/28.
 */
var GameOverLayer = cc.LayerColor.extend({
    ctor: function (options) {
        options = options || {};
        this.model = options.model;

        this._super(colors.card_detail_mask);

        var gameOver = new cc.LabelTTF(texts.game_over, "宋体", dimens.game_over_font_size);
        gameOver.attr({
            color: colors.game_over,
            x: cc.winSize.width/2,
            y: 950
        })
        this.addChild(gameOver);

        var score = buildRichText({
            str: "Lv"+gameModel.get("level")+" {[score]}"+gameModel.get("score"),
            fontSize:dimens.game_over_score_font_size
        });
        score.attr({
            x: cc.winSize.width/2,
            y: 800
        })
        this.addChild(score);

        var pleaseInputName = new cc.LabelTTF("伟大的城主大人，请留下大名", "宋体", dimens.game_over_score_font_size);
        pleaseInputName.attr({
            color: colors.game_over,
            x: cc.winSize.width/2,
            y: 680
        })
        this.addChild(pleaseInputName);

        var textFieldBg = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("long-normal.png"));
        textFieldBg.attr({
            x: cc.winSize.width/2,
            y: 555
        });
        this.addChild(textFieldBg);

        var textField = new ccui.TextField();
        textField.setTouchEnabled(true);
        textField.fontName = "宋体";
        textField.fontSize = dimens.game_over_score_font_size;
        textField.placeHolder = "请输入城主大名";
        textField.setTextColor(cc.color.BLACK);
        textField.setMaxLength(9);
        textField.x = cc.winSize.width / 2.0;
        textField.y = 550;
        textField.addEventListener(this.textFieldEvent, this);
        this.addChild(textField,5);
        this.textField = textField;

        var name;
        var store = cc.sys.localStorage.getItem("name");
        if ( store != null ){
            name = store;
            textField.setString(name)
        } else {
        }

        var continueItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
            cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
            function () {
                name = this.textField.getString();
                if ( name && name.trim() !== "" ) {
                    cc.sys.localStorage.setItem("name",name);
                    gameModel.set("playerName",name);
                }
                this.getParent().addChild(new ScoreBoardLayer());
                this.removeFromParent(true);
            }, this );
        continueItem.attr({
            x: cc.winSize.width / 2.0,
            y: 50,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var continueText = new cc.LabelTTF(texts.confirm, "宋体", dimens.game_over_score_font_size);
        continueText.attr({
            color: cc.color.BLACK,
            x: 85,
            y: 25
        });
        continueItem.addChild( continueText );

        var allCardItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
            cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
            function () {
                this.showAllCards();
            }, this );
        allCardItem.attr({
            x: cc.winSize.width / 2.0,
            y: 250,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var allCardText = new cc.LabelTTF("查看牌库", "宋体", dimens.game_over_score_font_size);
        allCardText.attr({
            color: cc.color.BLACK,
            x: 85,
            y: 25
        });
        allCardItem.addChild( allCardText );

        var continueMenu = new cc.Menu(continueItem,allCardItem);
        continueMenu.x = 0;
        continueMenu.y = 0;
        this.addChild(continueMenu, 20);
    },
    textFieldEvent: function (sender, type) {
        switch (type) {
            case ccui.TextField.EVENT_ATTACH_WITH_IME:
                this.textField.runAction(cc.moveBy(0.225, cc.p(0, 10)));
                break;
            case ccui.TextField.EVENT_DETACH_WITH_IME:
                this.textField.runAction(cc.moveBy(0.175, cc.p(0, -10)));
                break;
            case ccui.TextField.EVENT_INSERT_TEXT:
                break;
            case ccui.TextField.EVENT_DELETE_BACKWARD:
                break;
            default:
                break;
        }
    },

    showAllCards:function(){
        cc.director.pushScene(new ChooseCardScene({
            model: gameModel,
            range: ["discard", "deck", "dungeon", "hand"],
            hint: "你的牌库",
            validFilter:function(){
                return false
            }
        }));
    }
});

var FIREBASE_URL = "https://dungeon-deck.firebaseio.com"
var TOP_SCORE_COUNT = 20

var ScoreBoardLayer = cc.LayerColor.extend({
    ctor:function (options) {
        this._super(cc.color.WHITE);

        this.scoreQuery = new Firebase(FIREBASE_URL+"/score").endAt().limit(TOP_SCORE_COUNT);
        this.scoreRef = this.scoreQuery.ref();
        var self = this;
        this.score = null;
        this.__initList();

        if ( gameModel ) {
            var score = {
                name : gameModel.get("playerName"),
                ".priority": gameModel.get("score"),
                level: gameModel.get("level"),
                score : gameModel.get("score"),
                timestamp: Firebase.ServerValue.TIMESTAMP,
                r: Math.random()
            }
            this.score = score;
            this.scoreRef.push(score, function(){
                cc.log("score upload complete");
                self.__fetchScore.call(self);
            })
        } else {
            this.__fetchScore.call(self);
        }

        var scoreBoardTitle = new cc.LabelTTF("排行榜", "宋体", dimens.game_over_score_font_size);
        scoreBoardTitle.attr({
            color: cc.color.BLACK,
            x: cc.winSize.width/2,
            y: 1100
        })
        this.addChild(scoreBoardTitle);

        this.loading = new cc.LabelTTF("加载中……", "宋体", dimens.loading_score_board_font);
        this.loading.attr({
            color: cc.color.BLACK,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2
        })
        this.addChild(this.loading);

        var continueItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
            cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
            function () {
                cc.log("restart")
                window.gameModel = null;
                cc.director.runScene(window.mainGame = new MainGameScene());
            }, this );
        continueItem.attr({
            x: cc.winSize.width / 2.0,
            y: 50,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var continueText = new cc.LabelTTF(texts.restart, "宋体", dimens.game_over_score_font_size);
        continueText.attr({
            color: cc.color.BLACK,
            x: 85,
            y: 25
        });
        continueItem.addChild( continueText );
        var continueMenu = new cc.Menu(continueItem);
        continueMenu.x = 0;
        continueMenu.y = 0;
        this.addChild(continueMenu, 20);
    },

    __fetchScore:function(){
        var self = this;
        this.scoreQuery.once("value",function(snapshot){
            self.scores = snapshot.val();
            self.loading.removeFromParent(true);
            self.__renderList.call(self);
        })
    },

    __initList: function(){
        var size = cc.winSize

//        var coverBackground =new cc.LayerColor(cc.color(0,0,0,255))
//        //center
//        coverBackground.attr({
//            x: 0,
//            y: 0,
//            width: cc.winSize.width,
//            height: cc.winSize.height,
//            anchorX : 0.5,
//            anchorY : 0.5
//        });
//        this.addChild(coverBackground, -1);

        // Create the scrollview
        this.scrollView = new ccui.ScrollView();
        this.scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.scrollView.setTouchEnabled(true);
        this.scrollView.setContentSize(cc.size(dimens.score_board_width,dimens.score_board_height));
        this.scrollView.x = 0;
        this.scrollView.y = 60;
        this.addChild(this.scrollView,2)

    },

    __renderList:function(){
        var i = 0;
        var length = _.size(this.scores)
        var innerWidth = this.scrollView.width;
        var innerHeight = (TOP_SCORE_COUNT+2)*dimens.score_line_height;
        this.scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        this.startHeight = ( TOP_SCORE_COUNT - length + 2 )*dimens.score_line_height;

        var foundMyself = false;

        _.each(this.scores,function(score){
            if ( score.name ) {
                var color;
                if (score.r == this.score.r) {
                    foundMyself = true
                }

                this.generateOneScore(score,i);

                i++;
            }
        },this);

        if ( !foundMyself ) {
            var nameLabel = new cc.LabelTTF("……", "宋体", dimens.score_line_font_size);
            nameLabel.attr({
                color: cc.color.WHITE,
                x: 10,
                y: dimens.score_line_height + 10,
                anchorX: 0,
                anchorY: 0
            });
            this.scrollView.addChild(nameLabel);
            this.generateOneScore(this.score,-2);
        }
    },
    generateOneScore:function(score, i){
        var color;
        if (score.r == this.score.r) {
            color = cc.color(255, 0, 0, 255);
        } else
            color = cc.color.BLACK;

        var str = score.name;
        for ( var j = dbcsByteLength(str); j < 20; j++ ){
            str += " ";
        }
        str += "lv"+(score.level||1);
        for ( var j = dbcsByteLength(str); j < 26; j++ ){
            str += " ";
        }
        str += score.score + "分"
        for ( var j = dbcsByteLength(str); j < 36; j++ ){
            str += " ";
        }
        str += moment(score.timestamp).locale("zh-cn").fromNow();

        var nameLabel = new cc.LabelTTF(str, "宋体", dimens.score_line_font_size);
        nameLabel.attr({
            color: color,
            x: 10,
            y: (2 + i) * (dimens.score_line_height) + 10 + this.startHeight,
            anchorX: 0,
            anchorY: 0
        });
        this.scrollView.addChild(nameLabel);
    }

})

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