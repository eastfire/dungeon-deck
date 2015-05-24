/**
 * Created by 赢潮 on 2015/3/1.
 */
var UPGRADE_RANGE_LEVEL = {
    FROM_DISCARD : 1,
    FROM_DECK : 2,
    FROM_HAND : 3,
    FROM_DUNGEON : 4
    };

var GameModel = Backbone.Model.extend({
    defaults:function(){
        return {
            score: 0,

            initMoney:15,
            money : 10,
            maxMoney: 10,

            levelUpHpEffect: 5,
            baseHp: 0,
            hp : 20,
            maxHp : 20,

            upgradeChance: 2,

            defense: 0,

            level: 1,
            maxLevel: 1,

            exp: 0,
            maxExp: 10,
            status: null,
            phase: "hero-generate", //hero-generate , team-enter-dungeon, team-enter-level, team-enter-room, team-leave-room, team-leave-level, team
            heroList: [ "warrior" ],
            //initDeck: [ "skeleton", "skeleton","skeleton","skeleton","ratman","ratman","ratman","ratman" ],
            //initDeck: [ "magic-missile","skeleton", "skeleton","skeleton","skeleton","ratman","ratman","ratman","ratman" ],
            initDeck: [ "ooze","orc","vault","minotaur","ratman","skeleton" ],
            deck: [],
            isInitDeckShuffle: true,

            //initDiscardDeck: [ "magic-missile","skeleton", "skeleton","skeleton","skeleton","ratman","ratman","ratman","ratman","magic-missile","skeleton", "skeleton","skeleton","skeleton","ratman","ratman","ratman","ratman" ],
            initDiscardDeck: [ "orc" ],
            discardDeck: [],

            initHand: ["war-drum","magic-missile","magic-missile"],
            hand: [], //魔法
            maxHand: 4,

            team: [],

            costPerStage: 5,
            stage: [],
            stageNumber: 0,

            upgradeRangeLevel: UPGRADE_RANGE_LEVEL.FROM_DISCARD,

            initBonus: ["upgradeChance","maxHp","money","vault"],
            bonusPool : [],
            bonusChoiceNumber:3,
            bonusEachLevelUp: "alwaysLevelUpBonus",

            unlockedBuyableCards:[],
            regularBuyableCards: [],
            initRegularBuyableCards : [
                {
                    type:"vault",
                    count: 8
                },
                {
                    type:"hen-den",
                    count: 8
                },
                {
                    type:"ratman",
                    count: 8
                }, {
                    type:"skeleton",
                    count: 8
                }, {
                    type:"magic-missile",
                    count: 8
                },{
                    type:"lightening",
                    count: 8
                },{
                    type:"fireball",
                    count: 8
                }]
        }
    },
    initialize:function(){
        this.expUnused = 0;
        this.setLevel(1);
    },
    sortTeam:function(){
        var team = this.get("team");
        for ( var i = 0; i < team.length; i++ ) {
            var model = team[i];
            model.set("positionInTeam", i, {silent:true});
            model.trigger("change:positionInTeam");
        }
    },
    setLevel:function(l){
        this.set("level",l);
        this.set("maxHp",this.calMaxHp(l));
        this.set("hp", this.get("maxHp"));
        this.set("exp",0);
        this.set("maxExp",this.calExpRequire(l));
    },
    getExp:function(exp){
        if ( this.expUnused == 0 ) {
            this.expUnused += exp;
            this.checkLevelUp();
        } else {
            this.expUnused += exp;
        }
    },
    getScore:function(score){
        this.set("score",this.get("score")+score);
    },
    getTavernRecoveryEffect:function(diff){
        return diff;
    },
    getPayFromTavern:function(money){
        this.getMoney(money);
    },
    getMoney:function(money){
        this.set("money",Math.min( this.get("maxMoney") , this.get("money")+money ) );
    },
    useMoney:function(money){
        this.set("money", Math.max(0, this.get("money") - money ));
    },
    calExpRequire: function (lv) {
        return Math.round((Math.log10(lv) * lv * 16.61 + 10) /** (1 - (CUNNING_EFFECT / 100) * this.get("cunning"))*/);
    },
    calMaxHp: function (lv) {
        return lv * this.get("levelUpHpEffect") + this.get("baseHp");
    },
    checkLevelUp:function(){
        var currentExp = this.get("exp");
        var expRequire = this.get("maxExp");
        if (currentExp + this.expUnused >= expRequire) {
            this.levelUp();
            this.expUnused -= ( expRequire - currentExp );
            mainGame.showLevelUp(function(){
                this.checkLevelUp();
            },this)
        } else {
            this.set("exp", currentExp + this.expUnused);
            this.expUnused = 0;
        }
    },
    levelUp:function(){
        var newLevel = this.get("level") + 1;
        this.setLevel(newLevel);
    },
    isTeamAlive:function(){
        return _.any(this.get("team"),function(heroModel){
            return heroModel.get("hp") > 0;
        },this)
    },
    removeDeadHeroFromTeam:function(){
        var team = this.get("team");
        for ( var i = 0;i < team.length; ) {
            var model = team[i];

            if ( model.isAlive() ) {
                i++;
            } else {
                team.splice(i,1);
                model.destroy();
                model.off();
                model = null;
            }
        }
        this.sortTeam();
    },
    overMaxLevelHeroLeave:function(){
        var team = this.get("team");
        for ( var i = 0;i < team.length; ) {
            var model = team[i];

            if ( model.get("leaving") ) {
                team.splice(i,1);
                model.trigger("leaveTeam");
                model.off();
                model = null;
            } else {
                i++;
            }
        }
        this.sortTeam();
    },
    getBuildCost:function(){
        return this.get("stageNumber")* this.get("costPerStage");
    },
    isFullHand:function(){
        return this.get("hand").length >= this.get("maxHand");
    },
    getSpellCard:function(cardSprite){
        this.get("hand").push(cardSprite.model);
        cardSprite.removeFromParent(true);
        this.trigger("change:hand");
    },
    useSpellCard:function(cardModel){
        var hand = this.get("hand");
        var index = hand.indexOf(cardModel);
        if ( index != -1 )
            this.get("hand").splice(index,1);
        this.trigger("change:hand");
    },
    initDeck:function(){
        _.each( this.get("initDeck"), function(cardName){
            var Model = DUNGEON_CLASS_MAP[cardName];
            var model = new Model();
            this.get("deck").push( model );
        },this);

        if ( this.get("isInitDeckShuffle") )
            this.set("deck",_.shuffle(this.get("deck")));
    },
    initDiscardDeck:function(){
        _.each( this.get("initDiscardDeck"), function(cardName){
            var Model = DUNGEON_CLASS_MAP[cardName];
            var model = new Model({
                side: "front"
            });
            this.get("discardDeck").push( model );
        },this);

        if ( this.get("isInitDeckShuffle") )
            this.set("deck",_.shuffle(this.get("deck")));
    },
    initRegularBuyableCards:function(){
        _.each( this.get("initRegularBuyableCards"), function(entry){
            var deck = [];
            for ( var i = 0; i < entry.count; i++ ) {
                var Model = DUNGEON_CLASS_MAP[entry.type];
                var model = new Model({
                    side:"front"
                });
                deck.push( model );
            }
            this.get("regularBuyableCards").push(deck);
        },this);
    },
    initSpellBook:function(){
        _.each( this.get("initHand"), function(cardName){
            var Model = DUNGEON_CLASS_MAP[cardName];
            var model = new Model({
                side: "front"
            });
            this.get("hand").push( model );
        },this);
        this.trigger("change:hand");
    },
    initBonus:function(){
        _.each( this.get("initBonus"), function(bonusName){
            var Model = LEVEL_UP_BONUS_CLASS_MAP[bonusName];
            var model = new Model();
            this.get("bonusPool").push( model );
        },this);

        var eachLevelBonus = this.get("bonusEachLevelUp");
        if ( eachLevelBonus ) {
            var Model = LEVEL_UP_BONUS_CLASS_MAP[eachLevelBonus];
            this.set("bonusEachLevelUp", new Model());
        }
    },
    beAttacked:function(damage){
        var hp = this.get("hp");
        var realDamage = damage - this.get("defense");
        var hpLose = Math.min(hp, realDamage);
        this.set("hp", hp - hpLose );
        return hpLose;
    },
    initAll:function(){
        this.initDeck();
        this.initDiscardDeck();
        this.initRegularBuyableCards();
        this.initSpellBook();
        this.initBonus();
    },
    gainUpgradeChance:function(count){
        this.set("upgradeChance", this.get("upgradeChance")+count);
    }
})

var DungeonCardModel = Backbone.Model.extend({ //地城牌
    defaults:function(){
        return {
            name: "",
            backType:"dungeon",

            baseCost: 0,
            cost: 0,

            baseScore: 0,
            score: 0,

            baseUpgradeCost: 0,
            upgradeCost: 0,

            side: "back",

            level: 1,
            maxLevel: 1,

            status: "",

            upgradeable: true
        }
    },
    initialize:function(){
        this.initEvent();
        this.initByLevel();
        this.reEvaluate();
    },
    initEvent:function(){
        this.on("change:baseScore", this.evaluateScore, this);
        this.on("change:baseCost", this.evaluateCost, this);
        this.on("change:baseUpgradeCost", this.evaluateUpgradeCost, this);
        this.on("change:level", this.initByLevel, this);
    },
    reEvaluate:function(){
        this.evaluateScore();
        this.evaluateCost();
        this.evaluateUpgradeCost();
    },
    initByLevel:function(){

    },
    evaluateScore:function(){
        this.set("score", this.get("baseScore"));
    },
    evaluateCost:function(){
        this.set("cost", this.get("baseCost"));
    },
    evaluateUpgradeCost:function(){
        this.set("upgradeCost", this.get("baseUpgradeCost"));
    },
    getDescription:function(){
        var desc = CARD_TYPE_MAP[this.get("type")];
        if ( this.get("subtype") ) {
            desc = _.reduce(this.get("subtype").split(" "), function(memo, subtype){
                return memo + "—" + CARD_SUBTYPE_MAP[subtype];
            },desc, this);
        }
        return desc;
    },
    onDiscard : function(){
        this.resetToOrigin();
    },
    onReveal : function(){
        this.saveOrigin = this.toJSON();
    },
    onStageReveal: function(dungeonCards){
    },
    onGain:function(){
    },
    onExile:function(){
    },
    levelUp:function(){
        var newLevel = this.get("level") + 1;
        this.set("level", newLevel);
    },
    resetToOrigin:function(){
        if ( this.saveOrigin ) {
            this.saveOrigin.side = this.get("side");
            this.set(this.saveOrigin);
        }
    }
})






